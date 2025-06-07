#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
개선된 CSV 레시피 데이터 임포트 스크립트
CKG_MTRL_CN, RCP_STEP_DESC, RCP_STEP_IMG, RCP_HASHTAG 데이터를 제대로 파싱하여 업데이트
"""

import os
import pandas as pd
import psycopg2
import json
import ast
from urllib.parse import urlparse

def get_database_connection():
    """데이터베이스 연결"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise Exception("DATABASE_URL environment variable not set")
    
    parsed = urlparse(database_url)
    return psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port,
        database=parsed.path[1:],
        user=parsed.username,
        password=parsed.password
    )

def parse_list_field(text):
    """리스트 형태의 문자열 파싱"""
    if not text or text.strip() == '' or text == 'nan' or pd.isna(text):
        return []
    
    try:
        # 문자열이 리스트 형태인지 확인
        if isinstance(text, str) and text.startswith('[') and text.endswith(']'):
            try:
                parsed_list = ast.literal_eval(text)
                if isinstance(parsed_list, list):
                    return [str(item).strip() for item in parsed_list if str(item).strip()]
            except:
                pass
        
        # 기본적인 문자열 파싱
        if isinstance(text, str):
            items = [item.strip() for item in text.split(',') if item.strip()]
            return items
        
        return []
    except Exception as e:
        print(f"리스트 파싱 오류: {e}")
        return []

def parse_ingredients(text):
    """재료 리스트 파싱 (CKG_MTRL_CN)"""
    raw_list = parse_list_field(text)
    ingredients = []
    
    for item in raw_list:
        if ' || ' in item:
            # '재료명 || 양' 형태로 분리
            parts = item.split(' || ')
            if len(parts) >= 2:
                name = parts[0].strip()
                amount = parts[1].strip()
                if name and amount:
                    ingredients.append(f"{name} {amount}")
        elif item.strip():
            ingredients.append(item.strip())
    
    return ingredients[:15]  # 최대 15개로 제한

def parse_instructions(text):
    """조리법 파싱 (RCP_STEP_DESC)"""
    raw_list = parse_list_field(text)
    instructions = []
    
    for item in raw_list:
        if item.strip():
            # 조리 단계 텍스트 정리
            clean_text = item.strip().replace('\\n', '\n')
            instructions.append(clean_text)
    
    return instructions[:20]  # 최대 20단계로 제한

def update_recipe_data(cursor, recipe_id, ingredients, instructions):
    """레시피 데이터 업데이트"""
    try:
        update_sql = """
        UPDATE recipes 
        SET ingredients = %s, instructions = %s 
        WHERE id = %s
        """
        cursor.execute(update_sql, (
            json.dumps(ingredients, ensure_ascii=False),
            json.dumps(instructions, ensure_ascii=False),
            recipe_id
        ))
        return True
    except Exception as e:
        print(f"레시피 {recipe_id} 업데이트 오류: {e}")
        return False

def main():
    """메인 함수"""
    try:
        # CSV 파일 읽기 (다양한 인코딩 시도)
        print("CSV 파일 읽는 중...")
        encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1', 'iso-8859-1']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv('attached_assets/recipe_01_cleaned_final.csv', encoding=encoding)
                print(f"인코딩 {encoding}으로 파일 읽기 성공")
                break
            except UnicodeDecodeError:
                continue
        
        if df is None:
            raise Exception("지원되는 인코딩으로 CSV 파일을 읽을 수 없습니다")
        print(f"총 {len(df)}개의 레시피 데이터 발견")
        
        # 데이터베이스 연결
        print("데이터베이스 연결 중...")
        conn = get_database_connection()
        cursor = conn.cursor()
        
        # 기존 레시피 ID 조회
        cursor.execute("SELECT id, title FROM recipes ORDER BY id")
        existing_recipes = cursor.fetchall()
        recipe_map = {recipe[1]: recipe[0] for recipe in existing_recipes}
        
        updated_count = 0
        
        # CSV 데이터 처리
        for index, row in df.iterrows():
            try:
                title = str(row['RCP_TTL']).strip()
                
                # 기존 레시피 찾기
                recipe_id = None
                for existing_title, existing_id in recipe_map.items():
                    if existing_title == title:
                        recipe_id = existing_id
                        break
                
                if not recipe_id:
                    print(f"레시피 '{title}' 찾을 수 없음, 건너뛰기")
                    continue
                
                # 재료와 조리법 파싱
                ingredients = parse_ingredients(row.get('CKG_MTRL_CN', ''))
                instructions = parse_instructions(row.get('RCP_STEP_DESC', ''))
                
                if ingredients or instructions:
                    if update_recipe_data(cursor, recipe_id, ingredients, instructions):
                        updated_count += 1
                        print(f"✓ 레시피 {recipe_id} ({title}) 업데이트 완료")
                        print(f"  - 재료: {len(ingredients)}개")
                        print(f"  - 조리법: {len(instructions)}단계")
                
                # 50개마다 커밋
                if (index + 1) % 50 == 0:
                    conn.commit()
                    print(f"진행률: {index + 1}/{len(df)} ({((index + 1)/len(df)*100):.1f}%)")
                    
            except Exception as e:
                print(f"행 {index} 처리 중 오류: {e}")
                continue
        
        # 최종 커밋
        conn.commit()
        print(f"\n업데이트 완료!")
        print(f"총 {updated_count}개의 레시피가 업데이트되었습니다.")
        
        # 업데이트된 데이터 확인
        cursor.execute("""
        SELECT id, title, 
               json_array_length(ingredients) as ingredient_count,
               json_array_length(instructions) as instruction_count
        FROM recipes 
        WHERE json_array_length(ingredients) > 0 OR json_array_length(instructions) > 0
        ORDER BY id LIMIT 5
        """)
        
        print("\n업데이트된 레시피 샘플:")
        for row in cursor.fetchall():
            print(f"ID {row[0]}: {row[1]} - 재료 {row[2]}개, 조리법 {row[3]}단계")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"오류 발생: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    main()