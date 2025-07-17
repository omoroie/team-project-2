# Java 람다 표현식 Final 변수 문제 해결

## 🔧 문제 상황
Java에서 람다 표현식을 사용할 때 "Local variable is required to be final or effectively final" 오류 발생

## 📝 문제 원인

### Java 람다 표현식 규칙
- 람다 표현식에서 사용되는 지역 변수는 `final` 또는 `effectively final`이어야 함
- `effectively final`: 변수가 선언 후 재할당되지 않는 경우

### 문제가 된 코드
```java
// ❌ 문제가 되는 코드
Map<Long, List<RecipeStep>> stepsMap = new HashMap<>();
// ...
stepsMap = allSteps.stream()  // ← 재할당! 람다에서 사용 불가
    .collect(Collectors.groupingBy(RecipeStep::getRecipeId));

return recipes.stream()
    .map(recipe -> {
        List<RecipeStep> steps = stepsMap.getOrDefault(recipe.getId(), new ArrayList<>()); // ← 람다에서 사용
        // ...
    })
```

## 🛠️ 해결 방법

### ✅ 수정된 코드
```java
// ✅ 해결된 코드
final Map<Long, List<RecipeStep>> stepsMap;
final Map<Long, List<RecipeIngredient>> ingredientsMap;
final Map<Long, List<RecipeTag>> tagsMap;

if (!recipeIds.isEmpty()) {
    // 한 번만 할당
    stepsMap = allSteps.stream()
        .collect(Collectors.groupingBy(RecipeStep::getRecipeId));
    // ...
} else {
    // 빈 맵으로 초기화
    stepsMap = new HashMap<>();
    // ...
}

return recipes.stream()
    .map(recipe -> {
        List<RecipeStep> steps = stepsMap.getOrDefault(recipe.getId(), new ArrayList<>()); // ← 이제 사용 가능
        // ...
    })
```

## 📍 수정된 메서드들

### 1. `getAllRecipes()` 메서드
```java
// [CHANGED] 변수 선언 방식 변경
// 기존: Map<Long, List<RecipeStep>> stepsMap = new HashMap<>();
// 수정: final Map<Long, List<RecipeStep>> stepsMap;

// [CHANGED] 재할당 제거하고 조건부 초기화
if (!recipeIds.isEmpty()) {
    stepsMap = allSteps.stream().collect(Collectors.groupingBy(RecipeStep::getRecipeId));
} else {
    stepsMap = new HashMap<>();
}
```

### 2. `getAllRecipesPaged()` 메서드
```java
// [CHANGED] 동일한 패턴으로 수정
final Map<Long, List<RecipeStep>> stepsMap;
final Map<Long, List<RecipeIngredient>> ingredientsMap;
final Map<Long, List<RecipeTag>> tagsMap;

if (!recipeIds.isEmpty()) {
    // 한 번만 할당
} else {
    // 빈 맵으로 초기화
}
```

## 🎯 해결된 문제들

### ✅ 수정된 변수들
1. **`stepsMap`**: RecipeStep 맵
2. **`ingredientsMap`**: RecipeIngredient 맵  
3. **`tagsMap`**: RecipeTag 맵

### ✅ 수정된 메서드들
1. **`getAllRecipes()`**: 모든 레시피 조회
2. **`getAllRecipesPaged()`**: 페이징된 레시피 조회

## 📋 변경 사항 요약

### 🔄 수정된 파일
- **`backend/recipe-service/src/main/java/com/samsung/recipe/recipe/service/RecipeService.java`**

### 🆕 추가된 패턴
```java
// 1. final로 선언
final Map<Long, List<RecipeStep>> stepsMap;

// 2. 조건부 초기화 (재할당 없음)
if (condition) {
    stepsMap = someValue;
} else {
    stepsMap = defaultValue;
}

// 3. 람다에서 안전하게 사용
.stream().map(recipe -> {
    stepsMap.getOrDefault(recipe.getId(), new ArrayList<>());
})
```

## ✅ 결과
- ✅ Java 컴파일 오류 해결
- ✅ 람다 표현식에서 지역 변수 안전하게 사용
- ✅ 성능 최적화 유지 (배치 쿼리)
- ✅ 코드 가독성 향상

## 🚀 권장사항
- 람다 표현식에서 사용할 변수는 항상 `final` 또는 `effectively final`로 선언
- 변수 재할당이 필요한 경우 조건부 초기화 패턴 사용
- IDE의 경고를 주의 깊게 확인하여 미리 방지 