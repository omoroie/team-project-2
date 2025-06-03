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
            <div className="grid grid-cols-2 gap-6">
              {/* 첫 번째 열 */}
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://picsum.photos/350/280?random=1"
                    alt="한국 요리"
                    className="w-full h-[280px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://picsum.photos/350/200?random=2"
                    alt="신선한 재료"
                    className="w-full h-[200px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              {/* 두 번째 열 */}
              <div className="space-y-6 pt-12">
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://picsum.photos/350/220?random=3"
                    alt="요리 과정"
                    className="w-full h-[220px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src="https://picsum.photos/350/260?random=4"
                    alt="완성된 요리"
                    className="w-full h-[260px] object-cover hover:scale-105 transition-transform duration-300"
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
