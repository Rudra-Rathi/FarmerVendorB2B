import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, FilterX } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderItem from "@/components/dashboard/OrderItem";
import NegotiationDialog from "@/components/orders/NegotiationDialog";
import ReviewForm from "@/components/reviews/ReviewForm";
import { formatPrice, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const FarmerOrders = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [counterOfferDialogOpen, setCounterOfferDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const farmerId = userData.id;

  // Fetch orders
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!farmerId,
  });

  // Fetch produce
  const { data: produce } = useQuery({
    queryKey: [`/api/farmers/${farmerId}/produce`],
    enabled: !!farmerId,
  });

  // Filter orders by tab and search term
  const filteredOrders = orders
    ? orders.filter(order => {
        // Filter by tab
        if (activeTab === "pending") {
          return order.status === "negotiation";
        } else if (activeTab === "accepted") {
          return order.status === "accepted" || order.status === "completed";
        } else if (activeTab === "rejected") {
          return order.status === "rejected" || order.status === "cancelled";
        }
        return true;
      }).filter(order => {
        // Filter by search
        if (!searchTerm) return true;
        
        // Get produce name
        const orderProduce = produce?.find(p => p.id === order.produceId);
        if (!orderProduce) return false;
        
        return orderProduce.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               order.id.toString().includes(searchTerm);
      })
    : [];

  const handleOrderAction = async (orderId: number, action: 'accept' | 'reject' | 'counter') => {
    try {
      if (action === 'accept' || action === 'reject') {
        await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
          status: action === 'accept' ? 'accepted' : 'rejected'
        });
        
        refetch();
        
        toast({
          title: action === 'accept' ? t('order.accepted') : t('order.rejected'),
          description: action === 'accept' ? t('order.acceptSuccess') : t('order.rejectSuccess'),
        });
      } else if (action === 'counter') {
        // Get order details for counter offer
        const order = orders?.find(o => o.id === orderId);
        if (order) {
          const orderProduce = produce?.find(p => p.id === order.produceId);
          if (orderProduce) {
            setSelectedOrder({
              ...order,
              produceName: orderProduce.name
            });
            setCounterOfferDialogOpen(true);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: t('order.actionFailed'),
        description: error.message || t('order.actionError'),
        variant: "destructive",
      });
    }
  };

  const handleCounterOffer = async (data: { offeredPrice: number; message: string }) => {
    if (!selectedOrder) return;
    
    try {
      await apiRequest("POST", "/api/negotiations", {
        orderId: selectedOrder.id,
        offeredPrice: data.offeredPrice,
        message: data.message,
        status: "countered"
      });
      
      refetch();
      
      toast({
        title: t('negotiate.offerSent'),
        description: t('negotiate.offerSentMessage'),
      });
    } catch (error: any) {
      toast({
        title: t('negotiate.offerFailed'),
        description: error.message || t('negotiate.offerError'),
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async (orderId: number, vendorId: number, data: { rating: number; comment: string }) => {
    try {
      await apiRequest("POST", "/api/reviews", {
        orderId,
        reviewerId: farmerId,
        revieweeId: vendorId,
        rating: data.rating,
        comment: data.comment
      });
      
      refetch();
      
      toast({
        title: t('review.submitted'),
        description: t('review.submittedMessage'),
      });
    } catch (error: any) {
      toast({
        title: t('review.failed'),
        description: error.message || t('review.errorMessage'),
        variant: "destructive",
      });
    }
  };

  // Group orders by status for count display
  const pendingCount = orders?.filter(order => order.status === "negotiation").length || 0;
  const acceptedCount = orders?.filter(order => order.status === "accepted" || order.status === "completed").length || 0;
  const rejectedCount = orders?.filter(order => order.status === "rejected" || order.status === "cancelled").length || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-6 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('order.manageOrders')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('order.manageOrdersDesc')}
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
                  placeholder={t('actions.searchOrders')}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  <FilterX className="mr-2 h-4 w-4" />
                  {t('actions.clearFilters')}
                </Button>
              )}
            </div>
          </div>

          {/* Orders Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="pending">
                {t('order.pending')} ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                {t('order.accepted')} ({acceptedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                {t('order.rejected')} ({rejectedCount})
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="pending">
              {isLoading ? (
                <div className="bg-white shadow rounded-md">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-200 p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {filteredOrders.map(order => {
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
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? t('order.noMatchingOrders') : t('order.noPendingOrders')}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map(order => {
                    const orderProduce = produce?.find(p => p.id === order.produceId);
                    
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-lg mr-2">Order #{order.id}</h3>
                                <Badge variant={order.status === "completed" ? "success" : "secondary"}>
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
                              {order.commissionAmount && (
                                <p className="text-sm text-gray-500">
                                  {t('order.commission')}: {formatPrice(order.commissionAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {order.status === "completed" && !order.hasReviewed && (
                            <div className="mt-6 border-t pt-4">
                              <ReviewForm
                                orderId={order.id}
                                revieweeId={order.vendorId}
                                revieweeName="Vendor"
                                onSubmitReview={(data) => handleSubmitReview(order.id, order.vendorId, data)}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? t('order.noMatchingOrders') : t('order.noAcceptedOrders')}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map(order => {
                    const orderProduce = produce?.find(p => p.id === order.produceId);
                    
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-lg mr-2">Order #{order.id}</h3>
                                <Badge variant="destructive">
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? t('order.noMatchingOrders') : t('order.noRejectedOrders')}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Counter Offer Dialog */}
      {selectedOrder && (
        <NegotiationDialog
          open={counterOfferDialogOpen}
          onClose={() => setCounterOfferDialogOpen(false)}
          onSubmit={handleCounterOffer}
          produceId={selectedOrder.produceId}
          produceName={selectedOrder.produceName}
          currentPrice={selectedOrder.pricePerKg}
          quantity={selectedOrder.quantity}
          isCounterOffer={true}
        />
      )}
    </div>
  );
};

export default FarmerOrders;
