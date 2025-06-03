import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero-section py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                {t('heroSubtitle')}
              </h2>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {t('heroDescription')}
              </p>
            </div>
            
            <Link href="/recipes">
              <Button size="lg" className="recipe-gradient text-white px-8 py-6 text-lg font-medium hover:opacity-90 transition-opacity">
                {t('exploreRecipes')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Hero Products Display */}
              <div className="space-y-4">
                <div className="product-card p-6 aspect-square flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center"
                    alt="Recipe 1"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="product-card p-4 aspect-video flex items-center justify-center bg-accent/10">
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center"
                    alt="Ingredient"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-8">
                <div className="product-card p-4 aspect-video flex items-center justify-center bg-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop&crop=center"
                    alt="Cooking"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="product-card p-6 aspect-square flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&crop=center"
                    alt="Recipe 2"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
