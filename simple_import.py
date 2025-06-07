#!/usr/bin/env python3
import pandas as pd
import psycopg2
import re
from datetime import datetime

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': 'ep-shy-lab-a6zvz628.us-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_S37INUGMiWOl',
    'sslmode': 'require'
}

def parse_servings(text):
    if pd.isna(text):
        return 2
    match = re.search(r'(\d+)', str(text))
    return int(match.group(1)) if match else 2

def parse_cooking_time(text):
    if pd.isna(text):
        return 30
    match = re.search(r'(\d+)', str(text))
    return int(match.group(1)) if match else 30

def parse_difficulty(text):
    if pd.isna(text):
        return 'MEDIUM'
    text = str(text)
    if '쉬움' in text or '초급' in text:
        return 'EASY'
    elif '어려움' in text or '고급' in text:
        return 'HARD'
    return 'MEDIUM'

def main():
    # CSV 읽기
    df = pd.read_csv('attached_assets/recipe_01_cleaned_final.csv', encoding='cp949')
    
    # 데이터베이스 연결
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # 첫 5개만 테스트
        for i in range(min(5, len(df))):
            row = df.iloc[i]
            
            # 기본 작성자 생성
            cursor.execute("SELECT id FROM users WHERE username = 'admin' LIMIT 1")
            result = cursor.fetchone()
            if not result:
                cursor.execute("""
                    INSERT INTO users (username, email, password, is_corporate, created_at, updated_at)
                    VALUES ('admin', 'admin@recipe.com', '$2a$10$hash', false, %s, %s)
                    RETURNING id
                """, (datetime.now(), datetime.now()))
                author_id = cursor.fetchone()[0]
            else:
                author_id = result[0]
            
            # 레시피 삽입
            title = str(row.get('RCP_TTL', ''))[:100]  # 제목 길이 제한
            
            cursor.execute("""
                INSERT INTO recipes (
                    title, description, cooking_time, servings, difficulty,
                    image_url, author_id, view_count, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                title,
                f"{title} 레시피입니다.",
                parse_cooking_time(row.get('CKG_TIME_NM')),
                parse_servings(row.get('CKG_INBUN_NM')),
                parse_difficulty(row.get('CKG_DODF_NM')),
                str(row.get('RCP_IMG_URL', ''))[:500],  # URL 길이 제한
                author_id,
                0,
                datetime.now(),
                datetime.now()
            ))
            
            recipe_id = cursor.fetchone()[0]
            print(f"레시피 {recipe_id} 삽입 완료: {title}")
        
        conn.commit()
        print("데이터 삽입 성공!")
        
    except Exception as e:
        print(f"오류: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()