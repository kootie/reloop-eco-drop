import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QRScanner } from '@/components/QRScanner';
import { BinFinder } from '@/components/BinFinder';
import { DropInterface } from '@/components/DropInterface';
import { ReloopHeader } from '@/components/ReloopHeader';
import { ToxicityGuide } from '@/components/ToxicityGuide';
import { ImpactStats } from '@/components/ImpactStats';
import { Home, QrCode, MapPin, Award } from 'lucide-react';
import { Bin } from '@/types/reloop';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-reloop.jpg';

type AppState = 'welcome' | 'scan' | 'find' | 'drop' | 'complete' | 'stats' | 'guide';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [userPoints, setUserPoints] = useState(245); // Mock points
  const [sessionPoints, setSessionPoints] = useState(0);

  const handleScanResult = (binId: string) => {
    // In real app, fetch bin details
    toast({
      title: "Bin Scanned!",
      description: `Found bin ${binId}. Proceeding to drop interface.`,
    });
    
    // Mock bin for scanned ID
    const mockBin: Bin = {
      id: binId,
      lat: 40.7128,
      lng: -74.0060,
      qr_code_url: `https://reloop.city/drop?bin=${binId}`,
      is_online: true,
      fill_level: 35,
      door_open: false,
      electronics_count: [5, 3, 8, 12, 2, 6],
    };
    
    setSelectedBin(mockBin);
    setAppState('drop');
  };

  const handleBinFound = (bin: Bin) => {
    setSelectedBin(bin);
    setAppState('drop');
  };

  const handleDropComplete = (points: number) => {
    setSessionPoints(prev => prev + points);
    setUserPoints(prev => prev + points);
    setAppState('complete');
    
    toast({
      title: "Drop Successful!",
      description: `You earned ${points} points! Keep up the great work.`,
    });
  };

  const resetFlow = () => {
    setAppState('welcome');
    setSelectedBin(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'stats':
        return <ImpactStats onClose={() => setAppState('welcome')} userPoints={userPoints} />;
      
      case 'guide':
        return <ToxicityGuide onClose={() => setAppState('welcome')} />;
        
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={heroImage} 
                alt="Reloop Hero" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-primary-foreground">
                <h2 className="text-2xl font-bold">Drop. Earn. Repeat.</h2>
                <p className="text-sm opacity-90">Recycle e-waste in under 60 seconds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="eco" 
                size="lg" 
                onClick={() => setAppState('scan')}
                className="h-16"
              >
                <QrCode className="mr-3 w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Scan QR Code</div>
                  <div className="text-sm opacity-90">From any Reloop bin</div>
                </div>
              </Button>

              <Button 
                variant="card" 
                size="lg" 
                onClick={() => setAppState('find')}
                className="h-16"
              >
                <MapPin className="mr-3 w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Find Nearest Bin</div>
                  <div className="text-sm opacity-70">We'll guide you there</div>
                </div>
              </Button>
            </div>

            <Card className="p-4 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Impact</p>
                  <p className="text-2xl font-bold text-primary">{userPoints} points</p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
              {sessionPoints > 0 && (
                <div className="mt-2 text-sm text-toxicity-1 font-medium">
                  +{sessionPoints} points this session!
                </div>
              )}
            </Card>
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setAppState('welcome')}
              className="mb-4"
            >
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
            <QRScanner onScan={handleScanResult} />
          </div>
        );

      case 'find':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setAppState('welcome')}
              className="mb-4"
            >
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
            <BinFinder onBinFound={handleBinFound} />
          </div>
        );

      case 'drop':
        return selectedBin ? (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setAppState('welcome')}
              className="mb-4"
            >
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
            <DropInterface 
              bin={selectedBin} 
              onComplete={handleDropComplete} 
            />
          </div>
        ) : null;

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <Card className="p-8">
              <Award className="w-20 h-20 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Mission Complete!</h2>
              <p className="text-muted-foreground mb-4">
                You've successfully recycled your e-waste and earned points.
              </p>
              <div className="bg-gradient-eco rounded-lg p-4 mb-4">
                <p className="text-primary-foreground font-medium">
                  Session Total: +{sessionPoints} points
                </p>
              </div>
              <Button 
                variant="eco" 
                onClick={resetFlow}
                size="lg"
                className="w-full"
              >
                Drop More Items
              </Button>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ReloopHeader 
        points={userPoints} 
        onViewStats={() => setAppState('stats')}
        onViewInfo={() => setAppState('guide')}
      />
      
      <main className="max-w-md mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
