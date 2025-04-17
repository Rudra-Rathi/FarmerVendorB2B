import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, FilterX } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProduceItem from "@/components/marketplace/ProduceItem";
import NegotiationDialog from "@/components/orders/NegotiationDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

const VendorMarketplace = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("priceAsc");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minQuantity, setMinQuantity] = useState(200);
  const [negotiationDialogOpen, setNegotiationDialogOpen] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const vendorId = userData.id;

  // Fetch all active produce
  const { data: produce = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/produce'],
  });

  // Filter and sort produce
  const filteredProduce = produce
    ? produce.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === "all" || item.category.toLowerCase() === category.toLowerCase();
        const matchesPrice = item.pricePerKg >= priceRange[0] && item.pricePerKg <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      })
    : [];

  const sortedProduce = [...filteredProduce].sort((a, b) => {
    if (sortBy === "priceAsc") {
      return a.pricePerKg - b.pricePerKg;
    } else if (sortBy === "priceDesc") {
      return b.pricePerKg - a.pricePerKg;
    } else if (sortBy === "newest") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === "quantity") {
      return b.availableQuantity - a.availableQuantity;
    }
    return 0;
  });

  const handleViewDetails = (id: number) => {
    // Navigate to produce details page
    window.location.href = `/vendor/marketplace/${id}`;
  };

  const handleInitiateOrder = (id: number) => {
    const produceItem = produce?.find((p: any) => p.id === id);
    if (produceItem) {
      setSelectedProduce(produceItem);
      setOrderQuantity(produceItem.minOrderQuantity);
      setOrderDialogOpen(true);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduce) return;

    try {
      // First place order
      const orderResponse = await apiRequest("POST", "/api/orders", {
        produceId: selectedProduce.id,
        vendorId,
        quantity: orderQuantity,
        status: "negotiation"
      });
      
      const orderData = await orderResponse.json();
      
      // Then make initial offer
      setOrderDialogOpen(false);
      setNegotiationDialogOpen(true);
      
      // Store order ID for the negotiation step
      setSelectedProduce({
        ...selectedProduce,
        orderId: orderData.id
      });
    } catch (error: any) {
      toast({
        title: t('order.createFailed'),
        description: error.message || t('order.createError'),
        variant: "destructive",
      });
    }
  };

  const handleSubmitOffer = async (data: { offeredPrice: number; message: string }) => {
    if (!selectedProduce) return;
    
    try {
      await apiRequest("POST", "/api/negotiations", {
        orderId: selectedProduce.orderId,
        offeredPrice: data.offeredPrice,
        message: data.message
      });
      
      // Invalidate orders query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: t('negotiate.offerSent'),
        description: t('negotiate.offerSentMessage'),
      });
      
      // Redirect to orders page
      window.location.href = "/vendor/orders";
    } catch (error: any) {
      toast({
        title: t('negotiate.offerFailed'),
        description: error.message || t('negotiate.offerError'),
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setSortBy("priceAsc");
    setPriceRange([0, 100]);
    setMinQuantity(200);
  };

  // Find min and max prices for the slider
  const minPrice = produce ? Math.min(...produce.map(item => item.pricePerKg)) : 0;
  const maxPrice = produce ? Math.max(...produce.map(item => item.pricePerKg)) : 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-6 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('marketplace.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('marketplace.subtitle')}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={t('actions.search')}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('marketplace.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('marketplace.allCategories')}</SelectItem>
                    <SelectItem value="vegetable">{t('marketplace.vegetables')}</SelectItem>
                    <SelectItem value="fruit">{t('marketplace.fruits')}</SelectItem>
                    <SelectItem value="grain">{t('marketplace.grains')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('actions.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priceAsc">{t('actions.sortPriceLow')}</SelectItem>
                    <SelectItem value="priceDesc">{t('actions.sortPriceHigh')}</SelectItem>
                    <SelectItem value="newest">{t('actions.sortNewest')}</SelectItem>
                    <SelectItem value="quantity">{t('actions.sortQuantity')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {t('actions.filter')}
                </Button>
                {(searchTerm || category !== "all" || priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                  <Button 
                    variant="outline"
                    onClick={resetFilters}
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    {t('actions.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Produce Listings */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white shadow rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : sortedProduce.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProduce.map(item => (
                <ProduceItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description || ""}
                  category={item.category}
                  imageUrl={item.imageUrl}
                  pricePerKg={item.pricePerKg}
                  minOrderQuantity={item.minOrderQuantity}
                  availableQuantity={item.availableQuantity}
                  farmer={{
                    id: item.farmerId,
                    name: "Farmer", // This would come from the API
                    rating: 4.7, // This would come from the API
                  }}
                  updatedAt={item.updatedAt}
                  onOrder={() => handleInitiateOrder(item.id)}
                  onViewDetails={() => handleViewDetails(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {t('marketplace.noResults')}
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={resetFilters}
              >
                {t('actions.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('actions.advancedFilters')}</DialogTitle>
            <DialogDescription>
              {t('marketplace.filterDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t('marketplace.priceRange')}</h4>
              <div className="pt-6 pb-2">
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  onValueChange={setPriceRange}
                />
              </div>
              <div className="flex justify-between">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t('marketplace.minQuantity')}</h4>
              <div className="pt-6 pb-2">
                <Slider
                  value={[minQuantity]}
                  min={200}
                  max={1000}
                  step={50}
                  onValueChange={(value) => setMinQuantity(value[0])}
                />
              </div>
              <div className="flex justify-between">
                <span>{minQuantity}kg</span>
                <span>1000kg</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              {t('actions.applyFilters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      {selectedProduce && (
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('order.placeOrder')}</DialogTitle>
              <DialogDescription>
                {t('order.placeOrderDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedProduce.imageUrl}
                      alt={selectedProduce.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{selectedProduce.name}</h3>
                      <p className="text-sm text-gray-500">{selectedProduce.category}</p>
                      <p className="text-primary font-bold">{formatPrice(selectedProduce.pricePerKg)}/kg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('order.quantity')} (kg)
                </label>
                <Input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
                  min={selectedProduce.minOrderQuantity}
                  max={selectedProduce.availableQuantity}
                />
                <p className="text-xs text-gray-500">
                  {t('order.minQuantity')}: {selectedProduce.minOrderQuantity}kg | 
                  {t('order.maxQuantity')}: {selectedProduce.availableQuantity}kg
                </p>
              </div>
              
              <div className="flex justify-between font-medium">
                <span>{t('order.totalValue')}:</span>
                <span className="text-primary">
                  {formatPrice(selectedProduce.pricePerKg * orderQuantity)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button onClick={handlePlaceOrder} disabled={orderQuantity < selectedProduce.minOrderQuantity}>
                {t('order.continueToNegotiation')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Negotiation Dialog */}
      {selectedProduce && (
        <NegotiationDialog
          open={negotiationDialogOpen}
          onClose={() => setNegotiationDialogOpen(false)}
          onSubmit={handleSubmitOffer}
          produceId={selectedProduce.id}
          produceName={selectedProduce.name}
          currentPrice={selectedProduce.pricePerKg}
          quantity={orderQuantity}
          isCounterOffer={false}
        />
      )}
    </div>
  );
};

export default VendorMarketplace;
