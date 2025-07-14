export interface Bin {
  id: string;
  lat: number;
  lng: number;
  qr_code_url: string;
  is_online: boolean;
  fill_level: number; // 0-100%
  door_open: boolean;
  last_opened?: Date;
  electronics_count: number[];
  eta?: number; // walking time in minutes
  type: 'e-waste' | 'plastic'; // Bin type: e-waste or plastic
}

export interface DeviceType {
  id: number;
  category: string;
  name: string;
  toxicity_level: 1 | 2 | 3 | 4 | 5;
  color_hex: string;
  points: number;
  icon: string;
}

export interface Drop {
  id: string;
  user_id: string;
  bin_id: string;
  device_type_id: number;
  color_suggested: string;
  timestamp: Date;
  points_awarded: number;
  photo_url?: string;
}

export interface User {
  id: string;
  phone_hash: string;
  total_points: number;
  last_drop_ts?: Date;
}

export interface UnlockResponse {
  unlock_token: string;
  expires_in_sec: number;
}

export interface DropResponse {
  drop_id: string;
  points: number;
}

export type ToxicityLevel = 1 | 2 | 3 | 4 | 5;