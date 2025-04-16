import { useTranslation } from "react-i18next";
import { ShoppingBasket } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

interface ProduceItemProps {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  pricePerKg: number;
  minOrderQuantity: number;
  availableQuantity: number;
  farmer: {
    id: number;
    name: string;
    rating: number;
  };
  updatedAt: Date | string;
  onOrder: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const ProduceItem = ({
  id,
  name,
  description,
  category,
  imageUrl,
  pricePerKg,
  minOrderQuantity,
  availableQuantity,
  farmer,
  updatedAt,
  onOrder,
  onViewDetails,
}: ProduceItemProps) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={imageUrl} 
          alt={name} 
        />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <Badge>{category}</Badge>
        </div>
      </div>
      <CardContent className="flex-grow px-4 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 font-heading truncate">{name}</h3>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-sm font-medium">{farmer.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">{t('marketplace.pricePerKg')}</p>
            <p className="text-xl font-bold text-primary">{formatPrice(pricePerKg)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('marketplace.minOrder')}</p>
            <p className="text-base font-semibold text-gray-700">{minOrderQuantity}kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('marketplace.available')}</p>
            <p className="text-base font-semibold text-gray-700">{availableQuantity}kg</p>
          </div>
        </div>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <span className="mr-1">👨‍🌾</span>
          <span>{t('marketplace.by')} {farmer.name}</span>
          <span className="mx-2">•</span>
          <span>{formatRelativeTime(updatedAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t bg-gray-50">
        <div className="flex w-full space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(id)}
          >
            {t('actions.viewDetails')}
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onOrder(id)}
          >
            <ShoppingBasket className="mr-1 h-4 w-4" />
            {t('actions.order')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProduceItem;
