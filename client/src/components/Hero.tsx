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
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-muted-foreground">
                {t('heroSubtitle')}
              </h2>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('heroTitle').split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < t('heroTitle').split('\n').length - 1 && <br />}
                  </span>
                ))}
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
              {/* 첫 번째 열 */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250&fit=crop"
                    alt="한국 요리"
                    className="w-full h-[250px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop"
                    alt="신선한 재료"
                    className="w-full h-[250px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              {/* 두 번째 열 */}
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
                    alt="요리 과정"
                    className="w-full h-[250px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop"
                    alt="완성된 요리"
                    className="w-full h-[250px] object-cover hover:scale-105 transition-transform duration-300"
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
