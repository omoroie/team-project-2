import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ingredient } from '@shared/schema';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="product-card overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <img
          src={ingredient.imageUrl || 'https://picsum.photos/400/300?random=10'}
          alt={ingredient.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{ingredient.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {ingredient.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-accent">
            ₩{ingredient.price.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground ingredient-badge">
            /{ingredient.unit}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          disabled={!ingredient.inStock}
        >
          {ingredient.inStock ? t('addToCart') : '품절'}
        </Button>
      </CardFooter>
    </Card>
  );
}
