import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShoppingBasket, TrendingUp, BarChart2, ThumbsUp, Truck } from "lucide-react";

const HomePage = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    {t('home.hero.registerButton')}
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
                    {t('home.hero.loginButton')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="aspect-video bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1626906722163-bd4c03cb3b9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt={t('home.hero.imageAlt')}
                  className="w-full h-full object-cover"
                  onLoad={() => setIsLoaded(true)}
                />
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmers */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mb-6 mx-auto">
                  <ShoppingBasket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {t('home.howItWorks.farmers.title')}
                </h3>
                <p className="text-gray-600 text-center">
                  {t('home.howItWorks.farmers.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.farmers.point1')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.farmers.point2')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.farmers.point3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Marketplace */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary text-white mb-6 mx-auto">
                  <BarChart2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {t('home.howItWorks.marketplace.title')}
                </h3>
                <p className="text-gray-600 text-center">
                  {t('home.howItWorks.marketplace.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.marketplace.point1')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.marketplace.point2')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.marketplace.point3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Vendors */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent text-white mb-6 mx-auto">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {t('home.howItWorks.vendors.title')}
                </h3>
                <p className="text-gray-600 text-center">
                  {t('home.howItWorks.vendors.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.vendors.point1')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.vendors.point2')}</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('home.howItWorks.vendors.point3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              {t('home.features.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: t('home.features.dailyPrice.title'),
                description: t('home.features.dailyPrice.description')
              },
              {
                icon: <BarChart2 className="h-6 w-6" />,
                title: t('home.features.priceHistory.title'),
                description: t('home.features.priceHistory.description')
              },
              {
                icon: <ShoppingBasket className="h-6 w-6" />,
                title: t('home.features.bulkOrders.title'),
                description: t('home.features.bulkOrders.description')
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: t('home.features.negotiations.title'),
                description: t('home.features.negotiations.description')
              },
              {
                icon: <ThumbsUp className="h-6 w-6" />,
                title: t('home.features.reviews.title'),
                description: t('home.features.reviews.description')
              },
              {
                icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>,
                title: t('home.features.security.title'),
                description: t('home.features.security.description')
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              {t('home.testimonials.title')}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: t('home.testimonials.farmer1.quote'),
                name: t('home.testimonials.farmer1.name'),
                role: t('home.testimonials.farmer1.role'),
                image: "https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
              },
              {
                quote: t('home.testimonials.vendor1.quote'),
                name: t('home.testimonials.vendor1.name'),
                role: t('home.testimonials.vendor1.role'),
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
              },
              {
                quote: t('home.testimonials.farmer2.quote'),
                name: t('home.testimonials.farmer2.name'),
                role: t('home.testimonials.farmer2.role'),
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 font-heading">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  {t('home.cta.registerButton')}
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
                  {t('home.cta.loginButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
