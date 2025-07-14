import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeviceCategory } from './DeviceCategory';
import { Lock, Unlock, Timer, Award, CheckCircle } from 'lucide-react';
import { Bin, DeviceType } from '@/types/reloop';
import { api } from '@/services/api';
import { deviceTypes, getToxicityBgColor } from '@/data/deviceTypes';

interface DropInterfaceProps {
  bin: Bin;
  onComplete: (points: number) => void;
}

export function DropInterface({ bin, onComplete }: DropInterfaceProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isDropping, setIsDropping] = useState(false);
  const [dropComplete, setDropComplete] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setUnlockToken(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleOpenBin = async () => {
    if (!selectedDevice) return;
    
    try {
      const response = await api.openBin(bin.id);
      setUnlockToken(response.unlock_token);
      setTimeLeft(response.expires_in_sec);
    } catch (error) {
      console.error('Failed to open bin:', error);
    }
  };

  const simulateDropDetection = () => {
    setIsDropping(true);
    
    // Simulate item detection and processing
    setTimeout(async () => {
      if (selectedDevice) {
        try {
          const userId = api.generateUserId('demo-user');
          const response = await api.createDrop(userId, bin.id, selectedDevice.id);
          setEarnedPoints(response.points);
          setDropComplete(true);
          setIsDropping(false);
          setUnlockToken(null);
          
          // Complete after showing points
          setTimeout(() => {
            onComplete(response.points);
          }, 3000);
        } catch (error) {
          console.error('Failed to record drop:', error);
          setIsDropping(false);
        }
      }
    }, 2000);
  };

  if (dropComplete) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-4 text-toxicity-1" />
        <h2 className="text-2xl font-bold mb-2">Drop Successful!</h2>
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-3xl font-bold text-primary">+{earnedPoints}</span>
            <span className="text-xl text-muted-foreground">points</span>
          </div>
          <p className="text-muted-foreground">
            Thank you for keeping our planet clean!
          </p>
        </div>
        <div className="w-full bg-gradient-eco rounded-lg p-4">
          <p className="text-primary-foreground font-medium">
            Your e-waste is now safely stored and will be properly recycled
          </p>
        </div>
      </Card>
    );
  }

  if (isDropping) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-foreground rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Processing Drop...</h2>
        <p className="text-muted-foreground">
          Detecting item and calculating points
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What are you dropping?</h2>
        <div className="space-y-3">
          {deviceTypes.map((device) => (
            <DeviceCategory
              key={device.id}
              device={device}
              onSelect={setSelectedDevice}
              selected={selectedDevice?.id === device.id}
            />
          ))}
        </div>
      </Card>

      {selectedDevice && (
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-4 h-full ${getToxicityBgColor(selectedDevice.toxicity_level)} rounded-full h-16`} />
            <div>
              <h3 className="font-semibold">Selected: {selectedDevice.name}</h3>
              <p className="text-sm text-muted-foreground">
                Toxicity Level {selectedDevice.toxicity_level} • +{selectedDevice.points} points
              </p>
            </div>
          </div>

          {!unlockToken ? (
            <Button 
              onClick={handleOpenBin}
              variant="eco" 
              size="lg" 
              className="w-full"
            >
              <Unlock className="mr-2" />
              Open Bin
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {unlockToken}
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlock code shown on bin LED
                </p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">{timeLeft}s remaining</span>
                </div>
              </div>
              
              <Button 
                onClick={simulateDropDetection}
                variant="eco" 
                size="lg" 
                className="w-full"
              >
                I've Dropped the Item
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}