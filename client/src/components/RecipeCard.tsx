import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Link } from 'wouter';
import { Recipe } from '@shared/schema';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="product-card overflow-hidden group cursor-pointer">
        <div className="aspect-video overflow-hidden">
          <img
            src={recipe.imageUrl || 'https://picsum.photos/400/300?random=9'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
            {recipe.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 cooking-time-badge">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime}분</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-accent" />
              <span>{recipe.servings}인분</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="h-4 w-4 text-primary" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
