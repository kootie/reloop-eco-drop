import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Clock, Wifi, WifiOff, Battery } from 'lucide-react';
import { Bin } from '@/types/reloop';
import { api } from '@/services/api';

interface BinFinderProps {
  onBinFound: (bin: Bin) => void;
}

export function BinFinder({ onBinFound }: BinFinderProps) {
  const [loading, setLoading] = useState(false);
  const [nearestBin, setNearestBin] = useState<Bin | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      setUserLocation({ lat, lng });

      // Find nearest bin
      const bin = await api.getNearestBin(lat, lng);
      setNearestBin(bin);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      // Fallback to demo location (NYC)
      const demoLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(demoLocation);
      const bin = await api.getNearestBin(demoLocation.lat, demoLocation.lng);
      setNearestBin(bin);
    } finally {
      setLoading(false);
    }
  };

  const navigateToBin = () => {
    if (nearestBin && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${nearestBin.lat},${nearestBin.lng}`;
      window.open(url, '_blank');
    }
  };

  const confirmArrival = () => {
    if (nearestBin) {
      onBinFound(nearestBin);
    }
  };

  const getFillLevelColor = (level: number) => {
    if (level < 30) return 'text-toxicity-1';
    if (level < 70) return 'text-toxicity-3';
    return 'text-toxicity-4';
  };

  return (
    <div className="space-y-4">
      {!nearestBin ? (
        <Card className="p-6 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Find Nearest Reloop Bin</h3>
          <p className="text-muted-foreground mb-4">
            We'll help you find the closest available bin for your e-waste
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">Using demo location instead</p>
            </div>
          )}
          
          <Button 
            onClick={requestLocation} 
            disabled={loading}
            variant="eco" 
            size="lg" 
            className="w-full"
          >
            {loading ? 'Finding Bin...' : 'Find Nearest Bin'}
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Nearest Reloop Bin</h3>
              <p className="text-sm text-muted-foreground">Bin ID: {nearestBin.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {nearestBin.is_online ? (
                <Wifi className="w-5 h-5 text-toxicity-1" />
              ) : (
                <WifiOff className="w-5 h-5 text-destructive" />
              )}
              <Battery className={`w-5 h-5 ${getFillLevelColor(nearestBin.fill_level)}`} />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Walking time:</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{nearestBin.eta} min</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fill level:</span>
              <span className={`font-medium ${getFillLevelColor(nearestBin.fill_level)}`}>
                {nearestBin.fill_level}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={nearestBin.is_online ? 'text-toxicity-1' : 'text-destructive'}>
                {nearestBin.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={navigateToBin}
              variant="eco" 
              size="lg" 
              className="w-full"
              disabled={!nearestBin.is_online}
            >
              <Navigation className="mr-2" />
              Navigate to Bin
            </Button>
            
            <Button 
              onClick={confirmArrival}
              variant="outline" 
              className="w-full"
              disabled={!nearestBin.is_online}
            >
              I'm at the Bin
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}