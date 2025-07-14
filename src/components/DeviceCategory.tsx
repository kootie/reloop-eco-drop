import { DeviceType } from '@/types/reloop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Leaf, ChevronRight, Info } from 'lucide-react';
import { getToxicityColor, getToxicityBgColor, getToxicityLabel } from '@/data/deviceTypes';

interface DeviceCategoryProps {
  device: DeviceType;
  onSelect: (device: DeviceType) => void;
  selected?: boolean;
  showDetails?: boolean;
}

const getEnvironmentalImpact = (toxicityLevel: number): { 
  icon: React.ReactNode; 
  description: string; 
  details: string;
} => {
  switch (toxicityLevel) {
    case 1:
      return {
        icon: <Leaf className="w-4 h-4 text-toxicity-1" />,
        description: "Minimal environmental impact",
        details: "Contains mostly non-toxic materials like plastic and copper"
      };
    case 2:
      return {
        icon: <Leaf className="w-4 h-4 text-toxicity-2" />,
        description: "Low environmental risk",
        details: "Contains some rare earth elements but mostly safe materials"
      };
    case 3:
      return {
        icon: <AlertTriangle className="w-4 h-4 text-toxicity-3" />,
        description: "Moderate environmental impact",
        details: "Contains lithium, cobalt, and other moderately toxic elements"
      };
    case 4:
      return {
        icon: <AlertTriangle className="w-4 h-4 text-toxicity-4" />,
        description: "High environmental risk",
        details: "Contains heavy metals and complex electronic components"
      };
    case 5:
      return {
        icon: <AlertTriangle className="w-4 h-4 text-toxicity-5" />,
        description: "Very high environmental risk",
        details: "Contains lithium-ion cells, heavy metals, and toxic electrolytes"
      };
    default:
      return {
        icon: <Leaf className="w-4 h-4" />,
        description: "Unknown impact",
        details: "Environmental impact assessment needed"
      };
  }
};

export function DeviceCategory({ device, onSelect, selected = false, showDetails = false }: DeviceCategoryProps) {
  const toxicityColorClass = getToxicityColor(device.toxicity_level);
  const toxicityBgClass = getToxicityBgColor(device.toxicity_level);
  const toxicityLabel = getToxicityLabel(device.toxicity_level);
  const impact = getEnvironmentalImpact(device.toxicity_level);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-card-eco border-l-4 ${
        selected 
          ? 'ring-2 ring-primary bg-primary/5 shadow-card-eco scale-[1.02]' 
          : 'hover:scale-[1.01]'
      }`}
      style={{ borderLeftColor: device.color_hex }}
      onClick={() => onSelect(device)}
    >
      <div className="p-4">
        {/* Main Content Row */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="relative flex-shrink-0">
            <img 
              src={device.icon} 
              alt={device.name}
              className="w-14 h-14 object-contain"
            />
            <div 
              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${toxicityBgClass} flex items-center justify-center shadow-sm`}
            >
              <span className="text-xs font-bold text-white">
                {device.toxicity_level}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {device.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {impact.icon}
              <span className={`text-sm font-medium ${toxicityColorClass}`}>
                {toxicityLabel}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-lg font-bold text-primary">+{device.points}</span>
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
              selected ? 'rotate-90 text-primary' : 'text-muted-foreground'
            }`} />
          </div>
        </div>

        {/* Environmental Impact Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{impact.description}</span>
            <Badge 
              variant="outline" 
              className={`${toxicityColorClass} border-current`}
            >
              Level {device.toxicity_level}
            </Badge>
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md border-l-2" style={{ borderLeftColor: device.color_hex }}>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {impact.details}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toxicity Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Toxicity Level</span>
            <span>{device.toxicity_level}/5</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(device.toxicity_level / 5) * 100}%`,
                backgroundColor: device.color_hex 
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}