import { Bin, DeviceType, Drop, UnlockResponse, DropResponse, User } from '@/types/reloop';
import { deviceTypes } from '@/data/deviceTypes';

// Mock API service for MVP
class ReloopAPI {
  private baseUrl = 'https://api.reloop.city'; // Mock URL
  
  // Mock bins data
  private mockBins: Bin[] = [
    {
      id: 'bin-001',
      lat: 40.7128,
      lng: -74.0060,
      qr_code_url: 'https://reloop.city/drop?bin=bin-001',
      is_online: true,
      fill_level: 25,
      door_open: false,
      electronics_count: [5, 3, 8, 12, 2, 6],
      eta: 3,
    },
    {
      id: 'bin-002', 
      lat: 40.7614,
      lng: -73.9776,
      qr_code_url: 'https://reloop.city/drop?bin=bin-002',
      is_online: true,
      fill_level: 67,
      door_open: false,
      electronics_count: [8, 5, 15, 20, 4, 10],
      eta: 7,
    },
    {
      id: 'bin-003',
      lat: 40.7505,
      lng: -73.9934,
      qr_code_url: 'https://reloop.city/drop?bin=bin-003',
      is_online: false,
      fill_level: 45,
      door_open: false,
      electronics_count: [3, 2, 6, 8, 1, 4],
      eta: 12,
    },
  ];

  async getNearestBin(lat: number, lng: number): Promise<Bin> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find closest bin (simplified calculation)
    const nearest = this.mockBins
      .filter(bin => bin.is_online)
      .sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2));
        const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2));
        return distA - distB;
      })[0];

    return nearest || this.mockBins[0];
  }

  async getDeviceTypes(): Promise<DeviceType[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return deviceTypes;
  }

  async openBin(binId: string): Promise<UnlockResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock unlock token
    const token = Math.floor(10000 + Math.random() * 90000).toString();
    
    return {
      unlock_token: token,
      expires_in_sec: 30,
    };
  }

  async createDrop(userId: string, binId: string, deviceTypeId: number, photo?: string): Promise<DropResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    const points = deviceType ? deviceType.points : 10;
    
    return {
      drop_id: `drop-${Date.now()}`,
      points,
    };
  }

  async getUserPoints(userId: string): Promise<{ total_points: number; history: Drop[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock user points
    return {
      total_points: 245,
      history: [], // Simplified for MVP
    };
  }

  // Helper function to calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate mock user ID based on phone number
  generateUserId(phoneNumber: string): string {
    // Simple hash simulation - in real app this would be SHA256
    return `user-${phoneNumber.slice(-4)}-${Date.now()}`;
  }
}

export const api = new ReloopAPI();