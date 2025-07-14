import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, X, Award, Leaf, Recycle, TrendingUp } from 'lucide-react';

interface ImpactStatsProps {
  onClose: () => void;
  userPoints: number;
}

export function ImpactStats({ onClose, userPoints }: ImpactStatsProps) {
  // Mock environmental impact calculations
  const statsData = {
    totalDrops: Math.floor(userPoints / 20), // Estimated based on average points
    co2Saved: Math.round((userPoints / 10) * 0.5), // kg CO2
    metalRecovered: Math.round((userPoints / 25) * 2.3), // kg metals
    waterSaved: Math.round((userPoints / 15) * 12), // liters
    energySaved: Math.round((userPoints / 30) * 5.2), // kWh
  };

  const impactCards = [
    {
      icon: <Leaf className="w-6 h-6 text-toxicity-1" />,
      title: 'CO₂ Emissions Prevented',
      value: `${statsData.co2Saved} kg`,
      description: 'Equivalent to planting 2 trees',
      color: 'bg-toxicity-1/10 border-toxicity-1/20'
    },
    {
      icon: <Recycle className="w-6 h-6 text-primary" />,
      title: 'Metals Recovered',
      value: `${statsData.metalRecovered} kg`,
      description: 'Gold, silver, copper, and rare earth elements',
      color: 'bg-primary/10 border-primary/20'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-toxicity-2" />,
      title: 'Water Saved',
      value: `${statsData.waterSaved} L`,
      description: 'From mining and manufacturing processes',
      color: 'bg-toxicity-2/10 border-toxicity-2/20'
    },
    {
      icon: <Award className="w-6 h-6 text-toxicity-3" />,
      title: 'Energy Conserved',
      value: `${statsData.energySaved} kWh`,
      description: 'Enough to power a home for 2 days',
      color: 'bg-toxicity-3/10 border-toxicity-3/20'
    }
  ];

  const categoryBreakdown = [
    { name: 'Smartphones', count: 8, points: 200, percentage: 35 },
    { name: 'Cables & Chargers', count: 15, points: 150, percentage: 25 },
    { name: 'Batteries', count: 4, points: 140, percentage: 20 },
    { name: 'Small Appliances', count: 3, points: 120, percentage: 12 },
    { name: 'Light Bulbs', count: 6, points: 90, percentage: 8 }
  ];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-primary" />
            Your Environmental Impact
          </h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Stats */}
        <Card className="p-6 mb-6 bg-gradient-eco text-primary-foreground">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{userPoints}</div>
            <div className="text-lg mb-2">Total Points Earned</div>
            <div className="text-sm opacity-90">
              {statsData.totalDrops} successful e-waste drops
            </div>
          </div>
        </Card>

        {/* Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {impactCards.map((card, index) => (
            <Card key={index} className={`p-4 ${card.color}`}>
              <div className="flex items-start space-x-3">
                {card.icon}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                  <div className="text-2xl font-bold mb-1">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Category Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Recycle className="w-5 h-5 mr-2 text-primary" />
            Recycling by Category
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.count} items • {category.points} pts
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Environmental Message */}
        <Card className="p-6 bg-toxicity-1/10 border-toxicity-1/20">
          <h3 className="font-semibold mb-3 flex items-center text-toxicity-1">
            <Leaf className="w-5 h-5 mr-2" />
            Keep Making a Difference!
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Your responsible e-waste disposal is helping create a circular economy and 
              reducing the environmental impact of electronic waste.
            </p>
            <p>
              Every item you drop through Reloop helps recover valuable materials and 
              prevents toxic substances from entering our environment.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}