import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PriceChartProps {
  title: string;
  data: Array<{
    date: string;
    marketPrice: number;
    yourPrice?: number;
  }>;
  percentChange: number;
  currentMarketAvg: number;
  yourPrice?: number;
}

const PriceChart = ({
  title,
  data,
  percentChange,
  currentMarketAvg,
  yourPrice,
}: PriceChartProps) => {
  const { t } = useTranslation();

  const isPositiveChange = percentChange >= 0;

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white shadow rounded border border-gray-200">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatPrice(entry.value)}/kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <Badge variant={isPositiveChange ? "success" : "destructive"} className="flex items-center">
            {isPositiveChange ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(percentChange)}% {t('chart.fromLastWeek')}
          </Badge>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => `₹${value}`} 
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="marketPrice"
                name={t('chart.marketAverage')}
                stroke="#2D7A4D"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                fill="rgba(45, 122, 77, 0.1)"
              />
              {yourPrice && (
                <Line
                  type="monotone"
                  dataKey="yourPrice"
                  name={t('chart.yourPrice')}
                  stroke="#E56B1F"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            {t('chart.currentMarketAvg')}: <span className="font-medium text-gray-900">{formatPrice(currentMarketAvg)}/kg</span>
          </div>
          {yourPrice && (
            <div className="text-gray-500">
              {t('chart.yourPrice')}: <span className="font-medium text-primary">{formatPrice(yourPrice)}/kg</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
