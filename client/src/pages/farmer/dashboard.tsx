import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ShoppingBasket, FileText, IndianRupee, Star, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import ProduceCard from "@/components/dashboard/ProduceCard";
import OrderItem from "@/components/dashboard/OrderItem";
import PriceChart from "@/components/dashboard/PriceChart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [priceUpdateDialogOpen, setPriceUpdateDialogOpen] = useState(false);
  const [selectedProduceId, setSelectedProduceId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const farmerId = userData.id;

  // Fetch farmer's produce
  const { data: produce, isLoading: produceLoading, refetch: refetchProduce } = useQuery({
    queryKey: [`/api/farmers/${farmerId}/produce`],
    enabled: !!farmerId,
  });

  // Fetch farmer's orders
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!farmerId,
  });

  // Get pending orders (those in negotiation)
  const pendingOrders = orders?.filter(order => order.status === 'negotiation') || [];

  // Mock data for charts (would normally come from API)
  const tomatoChartData = [
    { date: 'Jun 1', marketPrice: 22, yourPrice: 23 },
    { date: 'Jun 3', marketPrice: 22.5, yourPrice: 23 },
    { date: 'Jun 5', marketPrice: 23, yourPrice: 24 },
    { date: 'Jun 7', marketPrice: 22.8, yourPrice: 24 },
    { date: 'Jun 9', marketPrice: 23.5, yourPrice: 24 },
    { date: 'Jun 11', marketPrice: 24, yourPrice: 25 },
    { date: 'Jun 13', marketPrice: 24.5, yourPrice: 25 },
  ];

  const potatoChartData = [
    { date: 'Jun 1', marketPrice: 18.5, yourPrice: 19 },
    { date: 'Jun 3', marketPrice: 18.3, yourPrice: 19 },
    { date: 'Jun 5', marketPrice: 18.2, yourPrice: 18.5 },
    { date: 'Jun 7', marketPrice: 18, yourPrice: 18.5 },
    { date: 'Jun 9', marketPrice: 17.8, yourPrice: 18 },
    { date: 'Jun 11', marketPrice: 17.9, yourPrice: 18 },
    { date: 'Jun 13', marketPrice: 17.8, yourPrice: 18 },
  ];

  const handleEditProduce = (id: number) => {
    // Navigate to edit produce page
    window.location.href = `/farmer/produce/edit/${id}`;
  };

  const handleUpdatePrice = (id: number) => {
    const selectedProduce = produce?.find(p => p.id === id);
    if (selectedProduce) {
      setSelectedProduceId(id);
      setNewPrice(selectedProduce.pricePerKg.toString());
      setPriceUpdateDialogOpen(true);
    }
  };

  const handlePriceUpdateSubmit = async () => {
    if (!selectedProduceId || !newPrice) return;

    try {
      await apiRequest("PATCH", `/api/produce/${selectedProduceId}`, {
        pricePerKg: parseFloat(newPrice)
      });
      
      refetchProduce();
      setPriceUpdateDialogOpen(false);
      
      toast({
        title: t('produce.priceUpdated'),
        description: t('produce.priceUpdateSuccess'),
      });
    } catch (error: any) {
      toast({
        title: t('produce.updateFailed'),
        description: error.message || t('produce.updateError'),
        variant: "destructive",
      });
    }
  };

  const handleOrderAction = async (orderId: number, action: 'accept' | 'reject' | 'counter') => {
    try {
      if (action === 'accept' || action === 'reject') {
        await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
          status: action === 'accept' ? 'accepted' : 'rejected'
        });
        
        refetchOrders();
        
        toast({
          title: action === 'accept' ? t('order.accepted') : t('order.rejected'),
          description: action === 'accept' ? t('order.acceptSuccess') : t('order.rejectSuccess'),
        });
      } else if (action === 'counter') {
        // Navigate to counter offer form
        window.location.href = `/farmer/orders/${orderId}/negotiate`;
      }
    } catch (error: any) {
      toast({
        title: t('order.actionFailed'),
        description: error.message || t('order.actionError'),
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const activeListings = produce?.filter(p => p.isActive)?.length || 0;
  const pendingOrdersCount = pendingOrders?.length || 0;
  
  // Calculate revenue (this would normally come from API or be calculated from completed orders)
  const revenue = 84550;

  // Calculate rating (this would normally come from API based on reviews)
  const rating = 4.7;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-6 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('farmer.dashboard')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('farmer.welcomeBack')}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/farmer/produce/new">
                <Button>
                  <ShoppingBasket className="mr-2 h-4 w-4" />
                  {t('produce.addNew')}
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
                label={t('dashboard.activeListings')}
                value={activeListings}
              />
              <StatCard
                icon={<FileText className="h-5 w-5 text-white" />}
                iconBgColor="bg-secondary"
                label={t('dashboard.pendingOrders')}
                value={pendingOrdersCount}
              />
              <StatCard
                icon={<IndianRupee className="h-5 w-5 text-white" />}
                iconBgColor="bg-accent"
                label={t('dashboard.revenueMTD')}
                value={formatPrice(revenue)}
              />
              <StatCard
                icon={<Star className="h-5 w-5 text-white" />}
                iconBgColor="bg-success"
                label={t('dashboard.farmerRating')}
                value={`${rating}/5`}
              />
            </div>
          </div>
          
          {/* Your Produce Listings */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('produce.yourListings')}</h2>
              <div className="flex space-x-3">
                {/* Category/Sort filters would go here */}
              </div>
            </div>
            
            {produceLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : produce && produce.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {produce.slice(0, 3).map(item => (
                  <ProduceCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl}
                    pricePerKg={item.pricePerKg}
                    minOrderQuantity={item.minOrderQuantity}
                    availableQuantity={item.availableQuantity}
                    totalQuantity={item.totalQuantity}
                    isActive={item.isActive}
                    updatedAt={item.updatedAt}
                    onEdit={handleEditProduce}
                    onUpdatePrice={handleUpdatePrice}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">{t('produce.noListings')}</p>
                <Link href="/farmer/produce/new">
                  <Button className="mt-4">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    {t('produce.addNew')}
                  </Button>
                </Link>
              </div>
            )}
            
            {produce && produce.length > 3 && (
              <div className="mt-4 flex justify-center">
                <Link href="/farmer/produce">
                  <Button variant="outline">
                    {t('actions.viewAll')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Pending Orders Section */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">{t('order.pendingOrders')}</h2>
            
            {ordersLoading ? (
              <div className="mt-4 bg-white shadow rounded-md">
                {[1, 2].map(i => (
                  <div key={i} className="border-b border-gray-200 p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : pendingOrders && pendingOrders.length > 0 ? (
              <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {pendingOrders.map(order => {
                    // Get the produce details
                    const orderProduce = produce?.find(p => p.id === order.produceId);
                    // Get the latest negotiation
                    const negotiation = order.latestNegotiation || { offeredPrice: order.pricePerKg };
                    
                    return (
                      <OrderItem
                        key={order.id}
                        id={order.id}
                        produceId={order.produceId}
                        produceName={orderProduce?.name || "Unknown Product"}
                        quantity={order.quantity}
                        originalPrice={order.pricePerKg}
                        offeredPrice={negotiation.offeredPrice}
                        totalValue={negotiation.offeredPrice * order.quantity}
                        vendorName="Vendor" // This would come from the API
                        status={order.status}
                        createdAt={order.createdAt}
                        onReject={() => handleOrderAction(order.id, 'reject')}
                        onCounterOffer={() => handleOrderAction(order.id, 'counter')}
                        onAccept={() => handleOrderAction(order.id, 'accept')}
                      />
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">{t('order.noOrders')}</p>
              </div>
            )}
            
            {pendingOrders && pendingOrders.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Link href="/farmer/orders">
                  <Button variant="outline">
                    {t('actions.viewAllOrders')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
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
                yourPrice={25}
              />
              
              <PriceChart
                title={t('chart.potatoPriceTrend')}
                data={potatoChartData}
                percentChange={-3}
                currentMarketAvg={17.80}
                yourPrice={18}
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
        </div>
      </main>
      <Footer />

      {/* Price Update Dialog */}
      <Dialog open={priceUpdateDialogOpen} onOpenChange={setPriceUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('produce.updatePrice')}</DialogTitle>
            <DialogDescription>
              {t('produce.updatePriceDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium col-span-1">
                {t('produce.newPrice')}
              </label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="pl-8"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceUpdateDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={handlePriceUpdateSubmit}>
              {t('actions.updatePrice')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboard;
