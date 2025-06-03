import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecipeCard } from '@/components/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@shared/schema';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function Recipes() {
  const { t } = useLanguage();
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('recipes')}
            </h1>
            <p className="text-gray-600">
              Discover amazing recipes from our community
            </p>
          </div>
          
          {state.isAuthenticated && (
            <Link href="/recipes/create">
              <Button className="samsung-gradient text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Recipe
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No recipes match "${searchQuery}". Try adjusting your search.`
                  : "No recipes have been shared yet. Be the first to share a recipe!"
                }
              </p>
              {state.isAuthenticated && (
                <Link href="/recipes/create">
                  <Button>Share Your Recipe</Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
