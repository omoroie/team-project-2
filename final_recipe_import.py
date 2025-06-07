#!/usr/bin/env python3
"""
CSV 레시피 데이터를 PostgreSQL 데이터베이스에 완전 삽입하는 스크립트
사용법: python final_recipe_import.py
"""

import pandas as pd
import psycopg2
import re
import json
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정 (필요시 수정)
DB_CONFIG = {
    'host': 'localhost',  # 또는 실제 호스트
    'database': 'recipe_db',
    'user': 'recipe_user', 
    'password': 'recipe_password',
    'port': 5432
}

def clean_text(text):
    """텍스트 정리 및 길이 제한"""
    if pd.isna(text) or text == '':
        return None
    cleaned = str(text).strip()
    return cleaned[:500] if len(cleaned) > 500 else cleaned  # 길이 제한

def parse_servings(text):
    """인분수 파싱: '2인분' → 2"""
    if pd.isna(text):
        return 2
    match = re.search(r'(\d+)', str(text))
    return int(match.group(1)) if match else 2

def parse_cooking_time(text):
    """조리시간 파싱: '20분내' → 20"""
    if pd.isna(text):
        return 30
    match = re.search(r'(\d+)', str(text))
    return int(match.group(1)) if match else 30

def parse_difficulty(text):
    """난이도 파싱"""
    if pd.isna(text):
        return 'MEDIUM'
    
    text = str(text).lower()
    if any(word in text for word in ['쉬움', '초급', '간단']):
        return 'EASY'
    elif any(word in text for word in ['어려움', '고급', '복잡']):
        return 'HARD'
    return 'MEDIUM'

def parse_ingredients(text):
    """재료 리스트 파싱"""
    if pd.isna(text):
        return ["기본 재료"]
    
    try:
        # JSON 형태로 파싱 시도
        if text.startswith('[') and text.endswith(']'):
            ingredients_list = eval(text)
            if isinstance(ingredients_list, list):
                parsed = [clean_text(item) for item in ingredients_list if clean_text(item)]
                return parsed[:20] if parsed else ["기본 재료"]  # 최대 20개
    except:
        pass
    
    # 문자열 분리 시도
    text = str(text).replace('[', '').replace(']', '').replace("'", "").replace('"', '')
    ingredients = [clean_text(item.strip()) for item in text.split(',') if clean_text(item.strip())]
    return ingredients[:20] if ingredients else ["기본 재료"]

def parse_instructions(text):
    """조리과정 파싱"""
    if pd.isna(text):
        return ["조리과정이 제공되지 않았습니다."]
    
    try:
        # JSON 형태로 파싱 시도
        if text.startswith('[') and text.endswith(']'):
            instructions_list = eval(text)
            if isinstance(instructions_list, list):
                parsed = [clean_text(item) for item in instructions_list if clean_text(item)]
                return parsed[:30] if parsed else ["조리과정이 제공되지 않았습니다."]  # 최대 30단계
    except:
        pass
    
    # 문자열 분리 시도
    text = str(text).replace('[', '').replace(']', '').replace("'", "").replace('"', '')
    instructions = [clean_text(item.strip()) for item in text.split(',') if clean_text(item.strip())]
    return instructions[:30] if instructions else ["조리과정이 제공되지 않았습니다."]

def get_or_create_user(cursor, author_name):
    """사용자 조회 또는 생성"""
    if not author_name or pd.isna(author_name):
        author_name = 'anonymous'
    
    author_name = clean_text(author_name) or 'anonymous'
    author_name = author_name[:50]  # 사용자명 길이 제한
    
    # 기존 사용자 확인
    cursor.execute("SELECT id FROM users WHERE username = %s", (author_name,))
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # 새 사용자 생성
    cursor.execute("""
        INSERT INTO users (username, email, password, is_corporate, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        author_name,
        f"{author_name}@recipe.com",
        "$2a$10$placeholder.hash.for.imported.users",
        False,
        datetime.now(),
        datetime.now()
    ))
    
    user_id = cursor.fetchone()[0]
    logger.info(f"새 사용자 생성: {author_name} (ID: {user_id})")
    return user_id

def insert_recipe_with_relations(cursor, recipe_data):
    """레시피와 관련 데이터 삽입"""
    # 기본 레시피 정보 삽입
    cursor.execute("""
        INSERT INTO recipes (
            title, description, cooking_time, servings, difficulty,
            image_url, author_id, view_count, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        recipe_data['title'],
        recipe_data['description'],
        recipe_data['cooking_time'],
        recipe_data['servings'],
        recipe_data['difficulty'],
        recipe_data['image_url'],
        recipe_data['author_id'],
        0,  # view_count
        datetime.now(),
        datetime.now()
    ))
    
    recipe_id = cursor.fetchone()[0]
    
    # 재료 삽입
    for ingredient in recipe_data['ingredients']:
        if ingredient and len(ingredient.strip()) > 0:
            cursor.execute("""
                INSERT INTO recipe_ingredients (recipe_id, ingredient)
                VALUES (%s, %s)
            """, (recipe_id, ingredient[:200]))  # 재료명 길이 제한
    
    # 조리과정 삽입
    for idx, instruction in enumerate(recipe_data['instructions']):
        if instruction and len(instruction.strip()) > 0:
            cursor.execute("""
                INSERT INTO recipe_instructions (recipe_id, instruction, instruction_order)
                VALUES (%s, %s, %s)
            """, (recipe_id, instruction[:1000], idx))  # 조리과정 길이 제한
    
    return recipe_id

def main():
    """메인 함수"""
    logger.info("CSV 레시피 데이터 임포트 시작")
    
    # CSV 파일 읽기
    try:
        df = pd.read_csv('recipe_01_cleaned_final.csv', encoding='cp949')
        logger.info(f"총 {len(df)}개의 레시피 데이터 로드 완료")
    except FileNotFoundError:
        logger.error("CSV 파일을 찾을 수 없습니다. 파일명과 경로를 확인하세요.")
        return
    except Exception as e:
        logger.error(f"CSV 파일 읽기 실패: {e}")
        return
    
    # 데이터베이스 연결
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        logger.info("데이터베이스 연결 성공")
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return
    
    try:
        success_count = 0
        error_count = 0
        
        for idx, row in df.iterrows():
            try:
                # 데이터 파싱
                title = clean_text(row.get('RCP_TTL'))
                if not title:
                    logger.warning(f"행 {idx}: 제목이 없어 건너뜀")
                    continue
                
                # 제목 길이 제한
                title = title[:100]
                
                # 작성자 처리
                author_name = clean_text(row.get('RGTR_NM', 'unknown'))
                author_id = get_or_create_user(cursor, author_name)
                
                # 이미지 URL 처리
                image_url = clean_text(row.get('RCP_IMG_URL'))
                if image_url and len(image_url) > 500:
                    image_url = image_url[:500]
                
                # 레시피 데이터 구성
                recipe_data = {
                    'title': title,
                    'description': f"{title} 레시피입니다.",
                    'cooking_time': parse_cooking_time(row.get('CKG_TIME_NM')),
                    'servings': parse_servings(row.get('CKG_INBUN_NM')),
                    'difficulty': parse_difficulty(row.get('CKG_DODF_NM')),
                    'image_url': image_url,
                    'author_id': author_id,
                    'ingredients': parse_ingredients(row.get('CKG_MTRL_CN')),
                    'instructions': parse_instructions(row.get('RCP_STEP_DESC'))
                }
                
                # 레시피 삽입
                recipe_id = insert_recipe_with_relations(cursor, recipe_data)
                success_count += 1
                
                # 진행률 표시
                if success_count % 50 == 0:
                    logger.info(f"진행률: {success_count}/{len(df)} 완료 ({success_count/len(df)*100:.1f}%)")
                    conn.commit()  # 주기적 커밋
                
            except Exception as e:
                error_count += 1
                logger.error(f"행 {idx} 처리 중 오류: {str(e)}")
                conn.rollback()
                continue
        
        # 최종 커밋
        conn.commit()
        logger.info(f"데이터 임포트 완료! 성공: {success_count}개, 실패: {error_count}개")
        
    except Exception as e:
        logger.error(f"전체 처리 중 오류 발생: {str(e)}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()
        logger.info("데이터베이스 연결 종료")

if __name__ == "__main__":
    main()