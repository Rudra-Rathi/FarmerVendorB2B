import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PriceChart from "@/components/dashboard/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";

const DailyMandi = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7days");
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all produce
  const { data: produce, isLoading: produceLoading } = useQuery({
    queryKey: ['/api/produce'],
  });

  // Filter produce by category and search term
  const filteredProduce = produce
    ? produce.filter(item => {
        const matchesCategory = category === "all" || item.category.toLowerCase() === category.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  // Mock price history data (would normally come from API)
  const mockPriceHistory = {
    "7days": [
      { date: 'Jun 1', marketPrice: 22 },
      { date: 'Jun 3', marketPrice: 22.5 },
      { date: 'Jun 5', marketPrice: 23 },
      { date: 'Jun 7', marketPrice: 22.8 },
      { date: 'Jun 9', marketPrice: 23.5 },
      { date: 'Jun 11', marketPrice: 24 },
      { date: 'Jun 13', marketPrice: 24.5 },
    ],
    "30days": [
      { date: 'May 15', marketPrice: 21 },
      { date: 'May 20', marketPrice: 21.5 },
      { date: 'May 25', marketPrice: 22 },
      { date: 'May 30', marketPrice: 22.5 },
      { date: 'Jun 4', marketPrice: 23 },
      { date: 'Jun 9', marketPrice: 23.5 },
      { date: 'Jun 13', marketPrice: 24.5 },
    ],
    "90days": [
      { date: 'Mar 15', marketPrice: 18 },
      { date: 'Apr 1', marketPrice: 19 },
      { date: 'Apr 15', marketPrice: 20 },
      { date: 'May 1', marketPrice: 21 },
      { date: 'May 15', marketPrice: 22 },
      { date: 'Jun 1', marketPrice: 23 },
      { date: 'Jun 13', marketPrice: 24.5 },
    ],
  };

  // Calculate price changes
  const calculatePriceChange = (prices: any[]) => {
    if (!prices || prices.length < 2) return 0;
    const firstPrice = prices[0].marketPrice;
    const lastPrice = prices[prices.length - 1].marketPrice;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
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
                {t('dailyMandi.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('dailyMandi.subtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('dailyMandi.selectTimeRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">{t('dailyMandi.last7Days')}</SelectItem>
                  <SelectItem value="30days">{t('dailyMandi.last30Days')}</SelectItem>
                  <SelectItem value="90days">{t('dailyMandi.last90Days')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Market Overview Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('dailyMandi.marketOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overview stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">{t('dailyMandi.totalProduce')}</p>
                  <p className="text-2xl font-bold">{produce?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">{t('dailyMandi.avgPriceChange')}</p>
                  <p className="text-2xl font-bold text-green-600">+4.2%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">{t('dailyMandi.mostIncreased')}</p>
                  <p className="text-lg font-bold">Tomatoes</p>
                  <p className="text-sm text-green-600">+8.0%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">{t('dailyMandi.mostDecreased')}</p>
                  <p className="text-lg font-bold">Potatoes</p>
                  <p className="text-sm text-red-600">-3.0%</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <SelectValue placeholder={t('marketplace.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('marketplace.allCategories')}</SelectItem>
                    <SelectItem value="vegetable">{t('marketplace.vegetables')}</SelectItem>
                    <SelectItem value="fruit">{t('marketplace.fruits')}</SelectItem>
                    <SelectItem value="grain">{t('marketplace.grains')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Price Charts */}
          <Tabs defaultValue="charts">
            <TabsList className="mb-4">
              <TabsTrigger value="charts">{t('dailyMandi.charts')}</TabsTrigger>
              <TabsTrigger value="table">{t('dailyMandi.table')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts">
              {produceLoading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white shadow rounded-lg h-[300px] animate-pulse" />
                  ))}
                </div>
              ) : filteredProduce.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {filteredProduce.map(item => {
                    const priceData = mockPriceHistory[timeRange as keyof typeof mockPriceHistory];
                    const percentChange = calculatePriceChange(priceData);
                    const currentPrice = priceData[priceData.length - 1].marketPrice;
                    
                    return (
                      <PriceChart
                        key={item.id}
                        title={`${item.name} ${t('chart.priceTrend')}`}
                        data={priceData}
                        percentChange={percentChange}
                        currentMarketAvg={currentPrice}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    {t('dailyMandi.noResults')}
                  </p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setCategory("all");
                    }}
                  >
                    {t('actions.clearFilters')}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">{t('dailyMandi.produceName')}</th>
                          <th className="px-4 py-3 text-left font-medium">{t('dailyMandi.category')}</th>
                          <th className="px-4 py-3 text-right font-medium">{t('dailyMandi.currentPrice')}</th>
                          <th className="px-4 py-3 text-right font-medium">{t('dailyMandi.priceChange')}</th>
                          <th className="px-4 py-3 text-right font-medium">{t('dailyMandi.lowestPrice')}</th>
                          <th className="px-4 py-3 text-right font-medium">{t('dailyMandi.highestPrice')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {produceLoading ? (
                          [1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan={6} className="px-4 py-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                              </td>
                            </tr>
                          ))
                        ) : filteredProduce.length > 0 ? (
                          filteredProduce.map(item => {
                            const priceData = mockPriceHistory[timeRange as keyof typeof mockPriceHistory];
                            const percentChange = calculatePriceChange(priceData);
                            const currentPrice = priceData[priceData.length - 1].marketPrice;
                            const lowestPrice = Math.min(...priceData.map(p => p.marketPrice));
                            const highestPrice = Math.max(...priceData.map(p => p.marketPrice));
                            
                            return (
                              <tr key={item.id}>
                                <td className="px-4 py-4 font-medium">{item.name}</td>
                                <td className="px-4 py-4">{item.category}</td>
                                <td className="px-4 py-4 text-right">{formatPrice(currentPrice)}/kg</td>
                                <td className={`px-4 py-4 text-right ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                                </td>
                                <td className="px-4 py-4 text-right">{formatPrice(lowestPrice)}/kg</td>
                                <td className="px-4 py-4 text-right">{formatPrice(highestPrice)}/kg</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              {t('dailyMandi.noResults')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyMandi;
