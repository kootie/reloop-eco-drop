import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, Camera, Type } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QRScannerProps {
  onScan: (binId: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      // Extract bin ID from URL or use direct input
      const binId = manualInput.includes('bin=') 
        ? new URL(manualInput).searchParams.get('bin') || manualInput
        : manualInput;
      onScan(binId);
    }
  };

  const handleQRScan = () => {
    // In a real app, this would open the camera for QR scanning
    // For MVP, we'll simulate scanning
    const mockBinId = 'bin-001';
    onScan(mockBinId);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <QrCode className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Scan Reloop Bin</h3>
        <p className="text-muted-foreground mb-4">
          Point your camera at the QR code on any Reloop bin to get started
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleQRScan}
            variant="eco" 
            size="lg" 
            className="w-full"
          >
            <Camera className="mr-2" />
            Open Camera
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full"
          >
            <Type className="mr-2" />
            Enter Bin ID Manually
          </Button>
        </div>
      </Card>

      {showManualInput && (
        <Card className="p-4">
          <div className="space-y-3">
            <Label htmlFor="binId">Bin ID or QR URL</Label>
            <Input
              id="binId"
              placeholder="Enter bin ID or scan URL..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}