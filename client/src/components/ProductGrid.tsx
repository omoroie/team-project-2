import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Users, ChefHat } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'recipe' | 'ingredient';
  // Recipe specific
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  // Ingredient specific
  price?: number;
  unit?: string;
  inStock?: boolean;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  viewAllHref: string;
  showPrice?: boolean;
}

export function ProductGrid({ title, products, viewAllHref, showPrice = false }: ProductGridProps) {
  const { t } = useLanguage();

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <Button variant="outline" asChild>
            <a href={viewAllHref}>
              {showPrice ? t('viewAllIngredients') : t('viewAllRecipes')}
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} className="product-card overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                  {product.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {!showPrice && product.type === 'recipe' && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {product.cookingTime && (
                      <div className="flex items-center space-x-1 cooking-time-badge">
                        <Clock className="h-4 w-4" />
                        <span>{product.cookingTime}분</span>
                      </div>
                    )}
                    {product.servings && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-accent" />
                        <span>{product.servings}인분</span>
                      </div>
                    )}
                    {product.difficulty && (
                      <div className="flex items-center space-x-1">
                        <ChefHat className="h-4 w-4 text-primary" />
                        <span>{product.difficulty}</span>
                      </div>
                    )}
                  </div>
                )}

                {showPrice && product.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-accent">
                      ₩{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ingredient-badge">
                      /{product.unit}
                    </span>
                  </div>
                )}
              </CardContent>

              {showPrice && (
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    disabled={!product.inStock}
                  >
                    {product.inStock ? t('addToCart') : '품절'}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
