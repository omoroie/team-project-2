-- PostgreSQL 초기화 스크립트
-- Recipe Service & User Service용 정규화된 테이블 생성

-- ✅ 사용자 테이블 (User Service)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_corporate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- ✅ 레시피 테이블 (Recipe Service)
CREATE TABLE recipes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cooking_time INTEGER,                            -- -> cookingTime
  servings INTEGER,                         -- -> serving
  difficulty TEXT,
  ingredients_count INTEGER,
  kind TEXT,
  situation TEXT,
  main_ingredient TEXT,
  cooking_method TEXT,
  writer_id TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,                   -- @CreatedDate
  updated_at TIMESTAMP,                    -- @LastModifiedDate
  image_url TEXT
);

-- ✅ 조리 단계 테이블
CREATE TABLE recipe_step (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT
);

-- ✅ 재료 테이블
CREATE TABLE ingredient (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- ✅ 레시피-재료 연결 테이블
CREATE TABLE recipe_ingredient (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
  amount TEXT
);

-- ✅ 태그 테이블
CREATE TABLE tag (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- ✅ 레시피-태그 연결 테이블
CREATE TABLE recipe_tag (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tag(id) ON DELETE CASCADE
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_recipes_writer_id ON recipes(writer_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_view_count ON recipes(view_count);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_cooking_time ON recipes(cooking_time);
CREATE INDEX idx_recipe_step_recipe_id ON recipe_step(recipe_id);
CREATE INDEX idx_recipe_ingredient_recipe_id ON recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_ingredient_id ON recipe_ingredient(ingredient_id);
CREATE INDEX idx_recipe_tag_recipe_id ON recipe_tag(recipe_id);
CREATE INDEX idx_recipe_tag_tag_id ON recipe_tag(tag_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email); 