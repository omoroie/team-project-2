#!/usr/bin/env python3
"""
CSV 레시피 데이터를 PostgreSQL 데이터베이스에 올바르게 삽입하는 스크립트
재료와 조리법을 제대로 파싱하여 저장
"""

import os
import psycopg2
import pandas as pd
import re
from psycopg2.extras import RealDictCursor

def get_database_connection():
    """데이터베이스 연결"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('PGHOST', 'localhost'),
            port=os.getenv('PGPORT', '5432'),
            database=os.getenv('PGDATABASE', 'postgres'),
            user=os.getenv('PGUSER', 'postgres'),
            password=os.getenv('PGPASSWORD', '')
        )
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None

def clean_text(text):
    """텍스트 정리"""
    if pd.isna(text) or text is None:
        return ""
    return str(text).strip()

def parse_servings(text):
    """인분수 파싱"""
    if pd.isna(text) or not text:
        return 2
    
    text = str(text).strip()
    match = re.search(r'(\d+)', text)
    return int(match.group(1)) if match else 2

def parse_cooking_time(text):
    """조리시간 파싱"""
    if pd.isna(text) or not text:
        return 30
    
    text = str(text).strip()
    match = re.search(r'(\d+)', text)
    return int(match.group(1)) if match else 30

def parse_difficulty(text):
    """난이도 파싱"""
    if pd.isna(text) or not text:
        return "EASY"
    
    text = str(text).lower().strip()
    if '어려' in text or 'hard' in text:
        return "HARD"
    elif '보통' in text or 'medium' in text:
        return "MEDIUM"
    else:
        return "EASY"

def parse_ingredients_list(text):
    """재료 리스트 파싱 - key-value 형식 지원"""
    if pd.isna(text) or not text:
        return []
    
    text = str(text).strip()
    if not text:
        return []
    
    # Python 리스트 형식 처리: ['재료1 || 분량1', '재료2 || 분량2']
    if text.startswith('[') and text.endswith(']'):
        try:
            import ast
            parsed = ast.literal_eval(text)
            if isinstance(parsed, list):
                ingredients = []
                for item in parsed:
                    if item and item.strip():
                        # key-value 형식 파싱: "재료명 || 분량"
                        if ' || ' in item:
                            name, quantity = item.split(' || ', 1)
                            ingredients.append(f"{name.strip()} {quantity.strip()}")
                        else:
                            ingredients.append(clean_text(item))
                return ingredients[:20]
        except:
            pass
    
    # 일반 텍스트 처리
    # 줄바꿈으로 구분된 경우
    if '\n' in text:
        ingredients = []
        for item in text.split('\n'):
            if item.strip():
                if ' || ' in item:
                    name, quantity = item.split(' || ', 1)
                    ingredients.append(f"{name.strip()} {quantity.strip()}")
                else:
                    ingredients.append(item.strip())
    # 쉼표로 구분된 경우
    elif ',' in text:
        ingredients = []
        for item in text.split(','):
            if item.strip():
                if ' || ' in item:
                    name, quantity = item.split(' || ', 1)
                    ingredients.append(f"{name.strip()} {quantity.strip()}")
                else:
                    ingredients.append(item.strip())
    # 세미콜론으로 구분된 경우
    elif ';' in text:
        ingredients = []
        for item in text.split(';'):
            if item.strip():
                if ' || ' in item:
                    name, quantity = item.split(' || ', 1)
                    ingredients.append(f"{name.strip()} {quantity.strip()}")
                else:
                    ingredients.append(item.strip())
    # 파이프로 구분된 경우
    elif '|' in text:
        ingredients = []
        for item in text.split('|'):
            if item.strip():
                if ' || ' in item:
                    name, quantity = item.split(' || ', 1)
                    ingredients.append(f"{name.strip()} {quantity.strip()}")
                else:
                    ingredients.append(item.strip())
    else:
        # 단일 재료인 경우
        if ' || ' in text:
            name, quantity = text.split(' || ', 1)
            ingredients = [f"{name.strip()} {quantity.strip()}"]
        else:
            ingredients = [text.strip()]
    
    # 빈 문자열 제거
    ingredients = [ing for ing in ingredients if ing and len(ing.strip()) > 0]
    
    return ingredients[:20]  # 최대 20개까지만

def parse_instructions_list(text):
    """조리과정 리스트 파싱 - 다양한 형식 지원"""
    if pd.isna(text) or not text:
        return []
    
    text = str(text).strip()
    if not text:
        return []
    
    # 줄바꿈으로 구분된 경우
    if '\n' in text:
        instructions = [item.strip() for item in text.split('\n') if item.strip()]
    # 파이프로 구분된 경우
    elif '|' in text:
        instructions = [item.strip() for item in text.split('|') if item.strip()]
    # 세미콜론으로 구분된 경우
    elif ';' in text:
        instructions = [item.strip() for item in text.split(';') if item.strip()]
    # 숫자로 시작하는 단계별 구분 (1. 2. 3. 형식)
    elif re.search(r'\d+\.', text):
        # 숫자와 점으로 구분된 단계들을 찾음
        parts = re.split(r'\d+\.', text)
        instructions = [item.strip() for item in parts if item.strip()]
    else:
        # 단일 과정인 경우
        instructions = [text.strip()]
    
    # 빈 문자열 제거 및 번호 정리
    cleaned_instructions = []
    for inst in instructions:
        inst = inst.strip()
        if inst and len(inst) > 2:  # 너무 짧은 것은 제외
            # 앞의 숫자나 특수문자 제거
            inst = re.sub(r'^\d+[\.\)]\s*', '', inst)
            inst = re.sub(r'^[\-\*]\s*', '', inst)
            if inst:
                cleaned_instructions.append(inst)
    
    return cleaned_instructions[:15]  # 최대 15단계까지

def parse_hashtags_list(text):
    """해시태그 리스트 파싱"""
    if pd.isna(text) or not text:
        return []
    
    text = str(text).strip()
    if not text:
        return []
    
    # Python 리스트 형식 처리: ['태그1', '태그2']
    if text.startswith('[') and text.endswith(']'):
        try:
            import ast
            parsed = ast.literal_eval(text)
            if isinstance(parsed, list):
                hashtags = []
                for tag in parsed:
                    if tag and tag.strip():
                        # #이 없으면 추가
                        clean_tag = tag.strip()
                        if not clean_tag.startswith('#'):
                            clean_tag = '#' + clean_tag
                        hashtags.append(clean_tag)
                return hashtags[:10]  # 최대 10개까지만
        except:
            pass
    
    # 일반 텍스트 처리
    if ',' in text:
        hashtags = []
        for tag in text.split(','):
            if tag.strip():
                clean_tag = tag.strip()
                if not clean_tag.startswith('#'):
                    clean_tag = '#' + clean_tag
                hashtags.append(clean_tag)
    elif '\n' in text:
        hashtags = []
        for tag in text.split('\n'):
            if tag.strip():
                clean_tag = tag.strip()
                if not clean_tag.startswith('#'):
                    clean_tag = '#' + clean_tag
                hashtags.append(clean_tag)
    else:
        # 단일 태그
        clean_tag = text.strip()
        if not clean_tag.startswith('#'):
            clean_tag = '#' + clean_tag
        hashtags = [clean_tag]
    
    return hashtags[:10]  # 최대 10개까지만

def get_or_create_user(cursor, author_name):
    """사용자 조회 또는 생성"""
    if not author_name or author_name.strip() == "":
        author_name = "레시피 제공자"
    
    # 기존 사용자 확인
    cursor.execute("SELECT id FROM users WHERE username = %s", (author_name,))
    result = cursor.fetchone()
    
    if result:
        return result['id']
    
    # 새 사용자 생성
    cursor.execute("""
        INSERT INTO users (username, email, password, is_corporate, created_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
        RETURNING id
    """, (
        author_name,
        f"{author_name.replace(' ', '').lower()}@recipe.com",
        "password123",  # 기본 비밀번호
        False
    ))
    
    return cursor.fetchone()['id']

def insert_recipe_with_proper_arrays(cursor, recipe_data):
    """레시피와 관련 데이터를 PostgreSQL 배열로 삽입"""
    try:
        # PostgreSQL 배열 형식으로 변환
        ingredients_array = '{' + ','.join([f'"{ing}"' for ing in recipe_data['ingredients']]) + '}'
        instructions_str = '|'.join(recipe_data['instructions'])
        
        # 해시태그 배열 형식으로 변환
        hashtags_array = '{' + ','.join([f'"{tag}"' for tag in recipe_data.get('hashtags', [])]) + '}' if recipe_data.get('hashtags') else '{}'
        
        # 레시피 삽입
        cursor.execute("""
            INSERT INTO recipes (
                title, description, ingredients, instructions, 
                cooking_time, servings, difficulty, image_url, hashtags, author_id, 
                view_count, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """, (
            recipe_data['title'],
            recipe_data['description'],
            ingredients_array,
            instructions_str,
            recipe_data['cooking_time'],
            recipe_data['servings'],
            recipe_data['difficulty'],
            recipe_data.get('image_url'),
            hashtags_array,
            recipe_data['author_id'],
            0  # 초기 조회수
        ))
        
        recipe_id = cursor.fetchone()['id']
        print(f"레시피 삽입 완료: ID {recipe_id}, 제목: {recipe_data['title']}")
        return recipe_id
        
    except Exception as e:
        print(f"레시피 삽입 실패: {e}")
        print(f"데이터: {recipe_data}")
        return None

def main():
    """메인 함수"""
    print("CSV 레시피 데이터 임포트 시작...")
    
    # 데이터베이스 연결
    conn = get_database_connection()
    if not conn:
        return
    
    try:
        # CSV 파일 로드 (다양한 인코딩 시도)
        csv_file = "attached_assets/recipe_01_cleaned_final.csv"
        
        for encoding in ['utf-8', 'cp949', 'euc-kr', 'latin-1']:
            try:
                print(f"{encoding} 인코딩으로 시도 중...")
                df = pd.read_csv(csv_file, encoding=encoding)
                print(f"성공! {encoding} 인코딩으로 {len(df)}개 레코드 로드")
                break
            except UnicodeDecodeError:
                continue
        else:
            print("지원되는 인코딩을 찾을 수 없습니다.")
            return
        
        print(f"컬럼: {list(df.columns)}")
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 기존 CSV 데이터 삭제 (ID 6 이상)
        cursor.execute("DELETE FROM recipes WHERE id >= 6")
        print("기존 CSV 데이터 삭제 완료")
        
        success_count = 0
        error_count = 0
        
        for index, row in df.iterrows():
            if index >= 20:  # 처음 20개만 임포트
                break
                
            try:
                # 필드 매핑 (실제 CSV 컬럼명 사용)
                title = clean_text(row.get('RCP_TTL', f'레시피 {index+1}'))
                description = f"{title} 레시피입니다"
                
                # 재료 파싱
                ingredients_raw = row.get('CKG_MTRL_CN', row.get('ingredients', ''))
                ingredients = parse_ingredients_list(ingredients_raw)
                
                # 조리법 파싱
                instructions_raw = row.get('RCP_STEP_DESC', row.get('instructions', ''))
                instructions = parse_instructions_list(instructions_raw)
                
                # 기본값 설정
                if not ingredients:
                    ingredients = [title + " 재료"]
                if not instructions:
                    instructions = [title + " 만들기"]
                
                # 사용자 생성
                author_name = clean_text(row.get('author', '레시피 제공자'))
                author_id = get_or_create_user(cursor, author_name)
                
                # 이미지 URL 파싱
                image_url = row.get('RCP_IMG_URL', '').strip()
                if not image_url or image_url == 'nan' or image_url == '':
                    image_url = None
                
                # 해시태그 파싱
                hashtags_raw = row.get('RCP_HASHTAG', '')
                hashtags = parse_hashtags_list(hashtags_raw)
                
                # 레시피 데이터 준비
                recipe_data = {
                    'title': title[:255],  # 길이 제한
                    'description': description[:2000],  # 길이 제한
                    'ingredients': ingredients,
                    'instructions': instructions,
                    'cooking_time': parse_cooking_time(row.get('CKG_TIME_NM', '')),
                    'servings': parse_servings(row.get('CKG_INBUN_NM', '')),
                    'difficulty': parse_difficulty(row.get('CKG_DODF_NM', '')),
                    'image_url': image_url,
                    'hashtags': hashtags,
                    'author_id': author_id
                }
                
                # 레시피 삽입
                recipe_id = insert_recipe_with_proper_arrays(cursor, recipe_data)
                
                if recipe_id:
                    success_count += 1
                else:
                    error_count += 1
                    
                # 진행상황 출력
                if (index + 1) % 10 == 0:
                    print(f"진행률: {index + 1}/{len(df)}, 성공: {success_count}, 실패: {error_count}")
                    
            except Exception as e:
                print(f"행 {index} 처리 중 오류: {e}")
                error_count += 1
                continue
        
        # 커밋
        conn.commit()
        print(f"\n임포트 완료!")
        print(f"총 처리: {success_count + error_count}")
        print(f"성공: {success_count}")
        print(f"실패: {error_count}")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()