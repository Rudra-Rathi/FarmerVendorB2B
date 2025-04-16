import { useTranslation } from "react-i18next";
import { ShoppingBasket, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatRelativeTime, generateOrderId } from "@/lib/utils";

interface OrderItemProps {
  id: number;
  produceId: number;
  produceName: string;
  quantity: number;
  originalPrice: number;
  offeredPrice: number;
  totalValue: number;
  vendorName: string;
  status: string;
  createdAt: Date | string;
  onReject: (id: number) => void;
  onCounterOffer: (id: number) => void;
  onAccept: (id: number) => void;
}

const OrderItem = ({
  id,
  produceId,
  produceName,
  quantity,
  originalPrice,
  offeredPrice,
  totalValue,
  vendorName,
  status,
  createdAt,
  onReject,
  onCounterOffer,
  onAccept,
}: OrderItemProps) => {
  const { t } = useTranslation();
  const orderId = generateOrderId();

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="truncate text-sm font-medium text-primary">#{orderId}</p>
          <div className="ml-2 flex-shrink-0 flex">
            <Badge variant="warning">
              {t(`order.status.${status.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 flex">
          <p className="text-sm text-gray-500">{formatRelativeTime(createdAt)}</p>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            <ShoppingBasket className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            {produceName} - {quantity}kg
          </p>
          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
            <Store className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            {t('order.vendor')}: {vendorName}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm text-gray-900 font-medium">
            <span className="text-gray-500">{t('order.yourPrice')}: </span>
            {formatPrice(originalPrice)}/kg
          </div>
          <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
          <div className="text-sm font-medium text-accent">
            <span className="text-gray-500">{t('order.offer')}: </span>
            {formatPrice(offeredPrice)}/kg
          </div>
          <div className="ml-4 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{t('order.totalValue')}: </span>
            {formatPrice(totalValue)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-700"
            onClick={() => onReject(id)}
          >
            {t('actions.reject')}
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onCounterOffer(id)}
          >
            {t('actions.counterOffer')}
          </Button>
          <Button 
            size="sm"
            onClick={() => onAccept(id)}
          >
            {t('actions.accept')}
          </Button>
        </div>
      </div>
    </li>
  );
};

export default OrderItem;
