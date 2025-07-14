import { DeviceType } from '@/types/reloop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getToxicityColor, getToxicityBgColor, getToxicityLabel } from '@/data/deviceTypes';

interface DeviceCategoryProps {
  device: DeviceType;
  onSelect: (device: DeviceType) => void;
  selected?: boolean;
}

export function DeviceCategory({ device, onSelect, selected = false }: DeviceCategoryProps) {
  const toxicityColorClass = getToxicityColor(device.toxicity_level);
  const toxicityBgClass = getToxicityBgColor(device.toxicity_level);
  const toxicityLabel = getToxicityLabel(device.toxicity_level);

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-card-eco ${
        selected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={() => onSelect(device)}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img 
            src={device.icon} 
            alt={device.name}
            className="w-16 h-16 object-contain"
          />
          <div 
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${toxicityBgClass} flex items-center justify-center`}
          >
            <span className="text-xs font-bold text-white">
              {device.toxicity_level}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{device.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-sm font-medium ${toxicityColorClass}`}>
              {toxicityLabel}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-primary">
              +{device.points} points
            </span>
          </div>
        </div>

        <div className={`w-4 h-full ${toxicityBgClass} rounded-full opacity-60`} />
      </div>
    </Card>
  );
}