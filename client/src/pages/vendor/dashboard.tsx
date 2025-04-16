import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ShoppingBasket, FileText, IndianRupee, Star, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import PriceChart from "@/components/dashboard/PriceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const VendorDashboard = () => {
  const { t } = useTranslation();

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const vendorId = userData.id;

  // Fetch vendor's orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!vendorId,
  });

  // Fetch available produce
  const { data: produce, isLoading: produceLoading } = useQuery({
    queryKey: ['/api/produce'],
  });

  // Get recent orders
  const recentOrders = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)
    : [];

  // Get recently visited produce (this would normally be tracked in state or localStorage)
  const recentlyViewedProduce = produce
    ? produce.slice(0, 4)
    : [];

  // Mock data for charts (would normally come from API)
  const tomatoChartData = [
    { date: 'Jun 1', marketPrice: 22 },
    { date: 'Jun 3', marketPrice: 22.5 },
    { date: 'Jun 5', marketPrice: 23 },
    { date: 'Jun 7', marketPrice: 22.8 },
    { date: 'Jun 9', marketPrice: 23.5 },
    { date: 'Jun 11', marketPrice: 24 },
    { date: 'Jun 13', marketPrice: 24.5 },
  ];

  const potatoChartData = [
    { date: 'Jun 1', marketPrice: 18.5 },
    { date: 'Jun 3', marketPrice: 18.3 },
    { date: 'Jun 5', marketPrice: 18.2 },
    { date: 'Jun 7', marketPrice: 18 },
    { date: 'Jun 9', marketPrice: 17.8 },
    { date: 'Jun 11', marketPrice: 17.9 },
    { date: 'Jun 13', marketPrice: 17.8 },
  ];

  // Calculate stats
  const pendingOrdersCount = orders?.filter(order => order.status === 'negotiation').length || 0;
  const activeOrdersCount = orders?.filter(order => order.status === 'accepted').length || 0;
  
  // Calculate spending (this would normally come from API or be calculated from completed orders)
  const spending = 102350;

  // Calculate rating (this would normally come from API based on reviews)
  const rating = 4.9;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-6 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('vendor.dashboard')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('vendor.welcomeBack')}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/vendor/marketplace">
                <Button>
                  <ShoppingBasket className="mr-2 h-4 w-4" />
                  {t('vendor.browseMarketplace')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-4">
            <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('dashboard.overview')}</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<ShoppingBasket className="h-5 w-5 text-white" />}
                iconBgColor="bg-primary-light"
                label={t('dashboard.pendingOrders')}
                value={pendingOrdersCount}
              />
              <StatCard
                icon={<FileText className="h-5 w-5 text-white" />}
                iconBgColor="bg-secondary"
                label={t('dashboard.activeOrders')}
                value={activeOrdersCount}
              />
              <StatCard
                icon={<IndianRupee className="h-5 w-5 text-white" />}
                iconBgColor="bg-accent"
                label={t('dashboard.spendingMTD')}
                value={formatPrice(spending)}
              />
              <StatCard
                icon={<Star className="h-5 w-5 text-white" />}
                iconBgColor="bg-success"
                label={t('dashboard.vendorRating')}
                value={`${rating}/5`}
              />
            </div>
          </div>
          
          {/* Daily Mandi Trends */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('dashboard.dailyMandiTrends')}</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <PriceChart
                title={t('chart.tomatoPriceTrend')}
                data={tomatoChartData}
                percentChange={8}
                currentMarketAvg={24.50}
              />
              
              <PriceChart
                title={t('chart.potatoPriceTrend')}
                data={potatoChartData}
                percentChange={-3}
                currentMarketAvg={17.80}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Link href="/daily-mandi">
                <Button variant="outline">
                  {t('actions.viewAllTrends')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('order.recentOrders')}</h2>
              <Link href="/vendor/orders">
                <Button variant="outline" size="sm">
                  {t('actions.viewAll')}
                </Button>
              </Link>
            </div>
            
            {ordersLoading ? (
              <div className="mt-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="mt-4 space-y-4">
                {recentOrders.map(order => {
                  const orderProduce = produce?.find(p => p.id === order.produceId);
                  
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium text-lg mr-2">Order #{order.id}</h3>
                              <Badge
                                variant={
                                  order.status === "accepted" || order.status === "completed"
                                    ? "success"
                                    : order.status === "negotiation"
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {t(`order.status.${order.status}`)}
                              </Badge>
                            </div>
                            <p className="text-gray-500 mb-2">
                              {orderProduce?.name} - {order.quantity}kg - {formatPrice(order.pricePerKg)}/kg
                            </p>
                            <p className="text-sm text-gray-500">
                              {t('order.ordered')}: {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <p className="text-lg font-bold text-primary">
                              {t('order.total')}: {formatPrice(order.totalAmount)}
                            </p>
                            <Link href={`/vendor/orders/${order.id}`}>
                              <Button variant="link" size="sm" className="mt-1">
                                {t('actions.viewDetails')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">{t('order.noOrders')}</p>
                <Link href="/vendor/marketplace">
                  <Button className="mt-4">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    {t('vendor.browseMarketplace')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Recently Viewed Products */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('vendor.recentlyViewed')}</h2>
              <Link href="/vendor/marketplace">
                <Button variant="outline" size="sm">
                  {t('actions.viewAll')}
                </Button>
              </Link>
            </div>
            
            {produceLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg h-48 animate-pulse" />
                ))}
              </div>
            ) : recentlyViewedProduce.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                {recentlyViewedProduce.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-32 w-full object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-primary font-bold">{formatPrice(item.pricePerKg)}/kg</span>
                        <Link href={`/vendor/marketplace/${item.id}`}>
                          <Button size="sm">
                            {t('actions.view')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">{t('vendor.noRecentItems')}</p>
                <Link href="/vendor/marketplace">
                  <Button className="mt-4">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    {t('vendor.browseMarketplace')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
