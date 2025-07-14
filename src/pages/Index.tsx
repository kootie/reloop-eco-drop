import { useState, useEffect, useRef } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import Login from './Login';
import Register from './Register';

type AppState = 'welcome' | 'scan' | 'find' | 'drop' | 'complete' | 'stats' | 'guide' | 'settings' | 'login' | 'register';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [userPoints, setUserPoints] = useState(245); // Mock points
  const [sessionPoints, setSessionPoints] = useState(0);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const deferredPrompt = useRef(null);
  const [user, setUser] = useState(null); // { id, phone_hash }
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const isMobile = useIsMobile();

  // Detect if in PWA
  const isInPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      if (!isInPWA()) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
    }
  };

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
      type: 'e-waste',
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

  // Add location update/clear logic
  const updateLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };
  const clearLocation = () => setUserLocation(null);

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
            {/* PWA Install Banner */}
            {showInstallBanner && !isInPWA() && (
              <div className="bg-primary/90 text-primary-foreground p-3 rounded-lg flex items-center justify-between mb-2 shadow-lg">
                <div>
                  <span className="font-semibold">Open in Reloop</span>
                  <span className="ml-2 text-sm opacity-80">Install the app for the best experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleInstallClick}>
                    Install
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setShowInstallBanner(false)}>
                    ×
                  </Button>
                </div>
              </div>
            )}
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

      case 'settings':
        return (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-primary"
                onClick={() => setAppState('welcome')}
                aria-label="Close settings"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold mb-1">User ID:</div>
                  <div className="text-muted-foreground">{user ? user.id : 'Not logged in'}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Mobile Device:</div>
                  <div className="text-muted-foreground">{isMobile ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Last Known Location:</div>
                  <div className="text-muted-foreground">
                    {userLocation ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` : 'Unknown'}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="secondary" onClick={updateLocation}>Update Location</Button>
                    <Button size="sm" variant="outline" onClick={clearLocation}>Clear</Button>
                  </div>
                </div>
                {!user && (
                  <div className="pt-2">
                    <Button variant="eco" className="w-full" onClick={() => setAppState('login')}>Login</Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => setAppState('register')}>Register</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'login':
        return (
          <Login
            onLogin={userObj => {
              setUser(userObj);
              setAppState('welcome');
            }}
            onRegister={() => setAppState('register')}
          />
        );
      case 'register':
        return (
          <Register
            onRegister={userObj => {
              setUser(userObj);
              setAppState('welcome');
            }}
            onLogin={() => setAppState('login')}
          />
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
        onViewSettings={() => setAppState('settings')}
        onLogin={() => setAppState('login')}
        onRegister={() => setAppState('register')}
        user={user}
      />
      
      <main className="max-w-md mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
