import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Leaf, Shield, X } from 'lucide-react';
import { deviceTypes } from '@/data/deviceTypes';

interface ToxicityGuideProps {
  onClose: () => void;
}

export function ToxicityGuide({ onClose }: ToxicityGuideProps) {
  const toxicityLevels = [
    {
      level: 1,
      label: 'Safe',
      color: '#16a34a',
      icon: <Leaf className="w-5 h-5" />,
      description: 'Minimal environmental impact',
      materials: 'Mostly non-toxic materials like plastic, copper, and aluminum',
      examples: ['USB cables', 'Phone chargers', 'Audio cables'],
      disposal: 'Easy to recycle with standard electronic waste processes'
    },
    {
      level: 2,
      label: 'Low Risk',
      color: '#84cc16',
      icon: <Leaf className="w-5 h-5" />,
      description: 'Low environmental risk',
      materials: 'Some rare earth elements but mostly safe materials',
      examples: ['LED bulbs', 'CFL lights', 'Small electronics'],
      disposal: 'Requires specialized recycling for glass and phosphor components'
    },
    {
      level: 3,
      label: 'Medium Risk',
      color: '#f59e0b',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Moderate environmental impact',
      materials: 'Contains lithium, cobalt, and moderately toxic elements',
      examples: ['Smartphones', 'Small appliances', 'Wireless devices'],
      disposal: 'Professional e-waste recycling required for safe material recovery'
    },
    {
      level: 4,
      label: 'High Risk',
      color: '#f97316',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'High environmental risk',
      materials: 'Heavy metals, complex electronic components, and rare earth elements',
      examples: ['Laptops', 'Tablets', 'Gaming devices'],
      disposal: 'Specialized facility required for safe dismantling and material recovery'
    },
    {
      level: 5,
      label: 'Very High Risk',
      color: '#dc2626',
      icon: <Shield className="w-5 h-5" />,
      description: 'Very high environmental risk',
      materials: 'Lithium-ion cells, heavy metals, toxic electrolytes, and complex circuits',
      examples: ['Power banks', 'Laptop batteries', 'Electric tool batteries'],
      disposal: 'Hazardous waste protocols required. Special handling for battery components'
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">E-Waste Toxicity Guide</h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {toxicityLevels.map((level) => (
            <Card key={level.level} className="p-6 border-l-4" style={{ borderLeftColor: level.color }}>
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: level.color }}
                >
                  {level.level}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div style={{ color: level.color }}>
                      {level.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{level.label}</h3>
                    <Badge variant="outline" style={{ color: level.color, borderColor: level.color }}>
                      Level {level.level}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{level.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Materials:</h4>
                      <p className="text-sm text-muted-foreground">{level.materials}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">Examples:</h4>
                      <div className="flex flex-wrap gap-1">
                        {level.examples.map((example, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">Disposal Requirements:</h4>
                      <p className="text-sm text-muted-foreground">{level.disposal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Why Proper E-Waste Disposal Matters
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Electronic waste contains valuable materials that can be recovered and reused, but also 
              hazardous substances that can harm the environment if not properly handled.
            </p>
            <p>
              By using Reloop, you're ensuring your e-waste is processed by certified recyclers who 
              follow strict environmental and safety protocols.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}