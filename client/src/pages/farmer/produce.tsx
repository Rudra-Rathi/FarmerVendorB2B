import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ShoppingBasket, Search, Filter } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProduceCard from "@/components/dashboard/ProduceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const FarmerProduce = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceUpdateDialogOpen, setPriceUpdateDialogOpen] = useState(false);
  const [selectedProduceId, setSelectedProduceId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const farmerId = userData.id;

  // Fetch farmer's produce
  const { data: produce, isLoading, refetch } = useQuery({
    queryKey: [`/api/farmers/${farmerId}/produce`],
    enabled: !!farmerId,
  });

  // Filter and sort produce
  const filteredProduce = produce
    ? produce.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === "all" || item.category.toLowerCase() === category.toLowerCase();
        return matchesSearch && matchesCategory;
      })
    : [];

  const sortedProduce = [...filteredProduce].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === "priceHigh") {
      return b.pricePerKg - a.pricePerKg;
    } else if (sortBy === "priceLow") {
      return a.pricePerKg - b.pricePerKg;
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

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
      
      refetch();
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-6 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('produce.manage')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('produce.manageDesc')}
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

          {/* Filters */}
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
                    <SelectValue placeholder={t('produce.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('produce.allCategories')}</SelectItem>
                    <SelectItem value="vegetable">{t('produce.vegetables')}</SelectItem>
                    <SelectItem value="fruit">{t('produce.fruits')}</SelectItem>
                    <SelectItem value="grain">{t('produce.grains')}</SelectItem>
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
                    <SelectItem value="newest">{t('actions.sortNewest')}</SelectItem>
                    <SelectItem value="priceHigh">{t('actions.sortPriceHigh')}</SelectItem>
                    <SelectItem value="priceLow">{t('actions.sortPriceLow')}</SelectItem>
                    <SelectItem value="name">{t('actions.sortName')}</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {searchTerm || category !== "all"
                  ? t('produce.noMatchingListings')
                  : t('produce.noListings')}
              </p>
              {!searchTerm && category === "all" && (
                <Link href="/farmer/produce/new">
                  <Button className="mt-4">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    {t('produce.addNew')}
                  </Button>
                </Link>
              )}
            </div>
          )}
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

export default FarmerProduce;
