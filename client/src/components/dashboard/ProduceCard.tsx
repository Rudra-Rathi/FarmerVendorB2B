import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Edit, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPrice, formatRelativeTime, calculatePercentage } from "@/lib/utils";

interface ProduceCardProps {
  id: number;
  name: string;
  imageUrl: string;
  pricePerKg: number;
  minOrderQuantity: number;
  availableQuantity: number;
  totalQuantity: number;
  isActive: boolean;
  updatedAt: Date | string;
  onEdit: (id: number) => void;
  onUpdatePrice: (id: number) => void;
}

const ProduceCard = ({
  id,
  name,
  imageUrl,
  pricePerKg,
  minOrderQuantity,
  availableQuantity,
  totalQuantity,
  isActive,
  updatedAt,
  onEdit,
  onUpdatePrice,
}: ProduceCardProps) => {
  const { t } = useTranslation();
  const availablePercentage = calculatePercentage(availableQuantity, totalQuantity);

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={imageUrl} 
          alt={name} 
        />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <Badge variant={isActive ? "success" : "secondary"}>
            {isActive ? t('produce.statusActive') : t('produce.statusInactive')}
          </Badge>
        </div>
      </div>
      <CardContent className="px-4 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 font-heading">{name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-1">⏱️</span>
            <span>{formatRelativeTime(updatedAt)}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{t('produce.currentPrice')}</p>
            <p className="text-xl font-bold text-primary">{formatPrice(pricePerKg)}/kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('produce.minOrder')}</p>
            <p className="text-xl font-bold text-gray-700">{minOrderQuantity}kg</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-500">{t('produce.availableQuantity')}</p>
          <div className="mt-1 relative pt-1">
            <Progress value={availablePercentage} className="h-2 bg-green-200" />
            <div className="flex justify-between text-xs font-semibold mt-1">
              <div>{availableQuantity}kg {t('produce.available')}</div>
              <div>{totalQuantity}kg {t('produce.total')}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(id)}
          >
            <Edit className="mr-1 h-4 w-4" />
            {t('actions.edit')}
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onUpdatePrice(id)}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            {t('actions.updatePrice')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProduceCard;
