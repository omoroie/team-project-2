#!/usr/bin/env python3
"""
CSV 레시피 데이터를 PostgreSQL 데이터베이스에 삽입하는 스크립트
"""

import pandas as pd
import psycopg2
import json
import re
from datetime import datetime
import os

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': 'ep-shy-lab-a6zvz628.us-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_S37INUGMiWOl',
    'sslmode': 'require'
}

def clean_text(text):
    """텍스트 정리"""
    if pd.isna(text) or text == '':
        return None
    return str(text).strip()

def parse_servings(servings_str):
    """인분수 파싱: '2인분' → 2"""
    if pd.isna(servings_str):
        return 2
    
    match = re.search(r'(\d+)', str(servings_str))
    if match:
        return int(match.group(1))
    return 2

def parse_cooking_time(time_str):
    """조리시간 파싱: '20분내' → 20"""
    if pd.isna(time_str):
        return 30
    
    match = re.search(r'(\d+)', str(time_str))
    if match:
        return int(match.group(1))
    return 30

def parse_difficulty(difficulty_str):
    """난이도 파싱"""
    if pd.isna(difficulty_str):
        return 'MEDIUM'
    
    difficulty_map = {
        '쉬움': 'EASY',
        '보통': 'MEDIUM', 
        '어려움': 'HARD',
        '초급': 'EASY',
        '중급': 'MEDIUM',
        '고급': 'HARD'
    }
    
    for korean, english in difficulty_map.items():
        if korean in str(difficulty_str):
            return english
    
    return 'MEDIUM'

def parse_ingredients(ingredients_str):
    """재료 리스트 파싱"""
    if pd.isna(ingredients_str):
        return []
    
    try:
        # JSON 형태로 파싱 시도
        ingredients_list = eval(ingredients_str)
        if isinstance(ingredients_list, list):
            return [clean_text(item) for item in ingredients_list if clean_text(item)]
    except:
        pass
    
    # 문자열로 분리 시도
    ingredients = str(ingredients_str).replace('[', '').replace(']', '').replace("'", "")
    return [clean_text(item) for item in ingredients.split(',') if clean_text(item)]

def parse_instructions(instructions_str):
    """조리과정 파싱"""
    if pd.isna(instructions_str):
        return []
    
    try:
        # JSON 형태로 파싱 시도
        instructions_list = eval(instructions_str)
        if isinstance(instructions_list, list):
            return [clean_text(item) for item in instructions_list if clean_text(item)]
    except:
        pass
    
    # 문자열로 분리 시도
    instructions = str(instructions_str).replace('[', '').replace(']', '').replace("'", "")
    return [clean_text(item) for item in instructions.split(',') if clean_text(item)]

def get_or_create_user(cursor, author_name):
    """사용자 조회 또는 생성"""
    if not author_name or pd.isna(author_name):
        author_name = 'unknown'
    
    author_name = clean_text(author_name)
    
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
        "$2a$10$placeholder.hash.for.imported.users",  # 기본 해시
        False,
        datetime.now(),
        datetime.now()
    ))
    
    return cursor.fetchone()[0]

def insert_recipe(cursor, recipe_data):
    """레시피 삽입"""
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
    for idx, ingredient in enumerate(recipe_data['ingredients']):
        cursor.execute("""
            INSERT INTO recipe_ingredients (recipe_id, ingredient)
            VALUES (%s, %s)
        """, (recipe_id, ingredient))
    
    # 조리과정 삽입
    for idx, instruction in enumerate(recipe_data['instructions']):
        cursor.execute("""
            INSERT INTO recipe_instructions (recipe_id, instruction, instruction_order)
            VALUES (%s, %s, %s)
        """, (recipe_id, instruction, idx))
    
    return recipe_id

def main():
    # CSV 파일 읽기 (다양한 인코딩 시도)
    print("CSV 파일을 읽는 중...")
    
    encodings = ['utf-8', 'cp949', 'euc-kr', 'iso-8859-1', 'latin1']
    df = None
    
    for encoding in encodings:
        try:
            df = pd.read_csv('attached_assets/recipe_01_cleaned_final.csv', encoding=encoding)
            print(f"성공적으로 {encoding} 인코딩으로 파일을 읽었습니다.")
            break
        except UnicodeDecodeError:
            print(f"{encoding} 인코딩 실패, 다음 인코딩 시도...")
            continue
    
    if df is None:
        print("파일을 읽을 수 없습니다.")
        return
        
    print(f"총 {len(df)}개의 레시피 데이터를 발견했습니다.")
    
    # 데이터베이스 연결
    print("데이터베이스에 연결 중...")
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        success_count = 0
        error_count = 0
        
        for idx, row in df.iterrows():
            try:
                # 데이터 파싱
                title = clean_text(row.get('RCP_TTL'))
                if not title:
                    print(f"행 {idx}: 제목이 없어 건너뜁니다.")
                    continue
                
                author_name = clean_text(row.get('RGTR_NM'))
                author_id = get_or_create_user(cursor, author_name)
                
                recipe_data = {
                    'title': title,
                    'description': f"{title}에 대한 상세한 레시피입니다.",
                    'cooking_time': parse_cooking_time(row.get('CKG_TIME_NM')),
                    'servings': parse_servings(row.get('CKG_INBUN_NM')),
                    'difficulty': parse_difficulty(row.get('CKG_DODF_NM')),
                    'image_url': clean_text(row.get('RCP_IMG_URL')),
                    'author_id': author_id,
                    'ingredients': parse_ingredients(row.get('CKG_MTRL_CN')),
                    'instructions': parse_instructions(row.get('RCP_STEP_DESC'))
                }
                
                # 레시피 삽입
                recipe_id = insert_recipe(cursor, recipe_data)
                success_count += 1
                
                if success_count % 10 == 0:
                    print(f"진행률: {success_count}/{len(df)} 완료")
                    conn.commit()  # 주기적 커밋
                
            except Exception as e:
                error_count += 1
                print(f"행 {idx} 처리 중 오류: {str(e)}")
                conn.rollback()
                continue
        
        # 최종 커밋
        conn.commit()
        print(f"\n데이터 삽입 완료!")
        print(f"성공: {success_count}개")
        print(f"실패: {error_count}개")
        
    except Exception as e:
        print(f"전체 처리 중 오류 발생: {str(e)}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()