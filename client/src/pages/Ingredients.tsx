import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IngredientCard } from '@/components/IngredientCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Ingredient } from '@shared/schema';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Ingredients() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ingredient.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              {t('ingredients')}
            </h1>
            <p className="text-gray-600">
              Fresh ingredients delivered to your door
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Ingredients Grid */}
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No ingredients found
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No ingredients match "${searchQuery}". Try adjusting your search.`
                  : "No ingredients available at the moment."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIngredients.map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
