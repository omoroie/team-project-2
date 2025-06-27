import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Link } from 'wouter';

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'recipe';
  // Recipe specific
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  viewAllHref: string;
}

export function ProductGrid({ title, products, viewAllHref }: ProductGridProps) {
  const { t } = useLanguage();

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <Button variant="outline" asChild>
            <a href={viewAllHref}>
              {t('viewAllRecipes')}
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <Link key={product.id} href={`/recipes/${product.id}`} className="block">
              <Card className="product-card overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
