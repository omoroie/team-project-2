import pandas as pd
import psycopg2
import ast
import re
import os
from datetime import datetime

# ✅ CSV 로드
df = pd.read_csv("recipe_03_final.csv", encoding="utf-8")

# ✅ 안전 파싱 함수
def safe_eval(x):
    try:
        return ast.literal_eval(x)
    except:
        return []

def extract_number(text):
    # "2인분" → 2, "20분 이내" → 20
    if pd.isna(text):
        return 0
    match = re.search(r'\d+', str(text))
    return int(match.group()) if match else 0

# ✅ 데이터 정리
df['RCP_HASHTAG'] = df['RCP_HASHTAG'].apply(safe_eval)
df['RCP_STEP_DESC'] = df['RCP_STEP_DESC'].apply(safe_eval)
df['RCP_STEP_IMG'] = df['RCP_STEP_IMG'].apply(safe_eval)
df['ingredients'] = df['CKG_MTRL_CN'].apply(safe_eval)
df['ingredient_count'] = df['ingredients'].apply(len)
df['servings'] = df['CKG_INBUN_NM'].apply(extract_number)
df['cooking_time'] = df['CKG_TIME_NM'].apply(extract_number)
df['description'] = ""  # description은 비워둠

def get_str(row, col):
    val = row.get(col, None)
    if pd.isna(val):
        return None
    return str(val)

def get_int(row, col):
    val = row.get(col, None)
    if pd.isna(val):
        return 0
    try:
        return int(val)
    except:
        return extract_number(val)

# ✅ GCP Cloud SQL 연결 (로컬 개발용 - Cloud SQL Proxy 필요)
# 환경변수에서 비밀번호를 가져오거나, 직접 입력
DB_PASSWORD = os.getenv('DB_PASSWORD', '실제_GCP_SQL_비밀번호_여기에_입력')

conn = psycopg2.connect(
    dbname="recipe_db",
    user="p646626910485-oprfkm@gcp-sa-cloud-sql.iam.gserviceaccount.com",
    password=DB_PASSWORD,
    host="127.0.0.1",  # Cloud SQL Proxy가 5432 포트로 포워딩
    port="5432"
)
cur = conn.cursor()

ingredient_cache = {}
tag_cache = {}

def get_or_create_ingredient(name):
    if name in ingredient_cache:
        return ingredient_cache[name]
    cur.execute("SELECT id FROM ingredient WHERE name = %s", (name,))
    result = cur.fetchone()
    if result:
        ingredient_id = result[0]
    else:
        cur.execute("INSERT INTO ingredient (name) VALUES (%s) RETURNING id", (name,))
        result = cur.fetchone()
        if result:
            ingredient_id = result[0]
        else:
            raise Exception(f"Failed to insert ingredient: {name}")
    ingredient_cache[name] = ingredient_id
    return ingredient_id

def get_or_create_tag(name):
    if name in tag_cache:
        return tag_cache[name]
    cur.execute("SELECT id FROM tag WHERE name = %s", (name,))
    result = cur.fetchone()
    if result:
        tag_id = result[0]
    else:
        cur.execute("INSERT INTO tag (name) VALUES (%s) RETURNING id", (name,))
        result = cur.fetchone()
        if result:
            tag_id = result[0]
        else:
            raise Exception(f"Failed to insert tag: {name}")
    tag_cache[name] = tag_id
    return tag_id

# ✅ 레시피 데이터 삽입 루프
for i, row in df.iterrows():
    # 안전하게 값 추출
    title = get_str(row, 'RCP_TTL')
    description = row['description']
    cooking_time = row['cooking_time']
    servings = row['servings']
    difficulty = get_str(row, 'CKG_DODF_NM')
    ingredients_count = row['ingredient_count']
    kind = get_str(row, 'CKG_KND_ACTO_NM')
    situation = get_str(row, 'CKG_STA_ACTO_NM')
    main_ingredient = get_str(row, 'CKG_MTRL_ACTO_NM')
    cooking_method = get_str(row, 'CKG_MTH_ACTO_NM')
    writer_id = get_str(row, 'RGTR_ID') or "1"
    view_count = get_int(row, 'RCP_VIEW_CNT')
    image_url = get_str(row, 'RCP_IMG_URL')

    print(f"[{i}] title: {title}, image_url: {image_url}")

    cur.execute("""
        INSERT INTO recipes (
            title, description, cooking_time, servings, difficulty,
            ingredients_count, kind, situation, main_ingredient, cooking_method,
            writer_id, view_count, created_at, updated_at, image_url
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        title, description, cooking_time, servings, difficulty,
        ingredients_count, kind, situation, main_ingredient, cooking_method,
        writer_id, view_count, datetime.now(), datetime.now(), image_url
    ))
    result = cur.fetchone()
    if result:
        recipe_id = result[0]
    else:
        raise Exception(f"Failed to insert recipe: {title}")

    # 🪜 조리 단계 삽입
    step_descs = row['RCP_STEP_DESC'] if isinstance(row['RCP_STEP_DESC'], list) else []
    step_imgs = row['RCP_STEP_IMG'] if isinstance(row['RCP_STEP_IMG'], list) else []
    for idx, (desc, img) in enumerate(zip(step_descs, step_imgs), start=1):
        desc_str = desc.strip() if isinstance(desc, str) else str(desc).strip()
        img_str = img.strip() if isinstance(img, str) else str(img).strip()
        cur.execute("""
            INSERT INTO recipe_step (recipe_id, step_index, description, image_url)
            VALUES (%s, %s, %s, %s)
        """, (recipe_id, idx, desc_str, img_str))

    # 🧂 재료 삽입
    ingredients = row['ingredients'] if isinstance(row['ingredients'], list) else []
    for ing in ingredients:
        if ':' in ing:
            name, amount = [part.strip() for part in ing.split(':', 1)]
        else:
            name, amount = ing.strip(), None
        if name:
            ing_id = get_or_create_ingredient(name)
            cur.execute("""
                INSERT INTO recipe_ingredient (recipe_id, ingredient_id, amount)
                VALUES (%s, %s, %s)
            """, (recipe_id, ing_id, amount))

    # 🏷️ 태그 삽입
    hashtags = row['RCP_HASHTAG'] if isinstance(row['RCP_HASHTAG'], list) else []
    for tag in hashtags:
        clean_tag = tag.strip()
        if clean_tag:
            tag_id = get_or_create_tag(clean_tag)
            cur.execute("""
                INSERT INTO recipe_tag (recipe_id, tag_id)
                VALUES (%s, %s)
            """, (recipe_id, tag_id))

# ✅ 커밋 및 종료
conn.commit()
cur.close()
conn.close()
print("✅ 모든 레시피 데이터를 정규 테이블에 삽입 완료했습니다.")
