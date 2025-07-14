import { DeviceType } from '@/types/reloop';
import smartphoneIcon from '@/assets/device-smartphone.png';
import laptopIcon from '@/assets/device-laptop.png';
import batteryIcon from '@/assets/device-battery.png';
import cableIcon from '@/assets/device-cable.png';
import applianceIcon from '@/assets/device-appliance.png';
import lightbulbIcon from '@/assets/device-lightbulb.png';

export const deviceTypes: DeviceType[] = [
  {
    id: 1,
    category: 'Smartphones',
    name: 'Smartphones',
    toxicity_level: 3,
    color_hex: '#f59e0b', // Yellow - Medium toxicity
    points: 25,
    icon: smartphoneIcon,
  },
  {
    id: 2,
    category: 'Tablets / Laptops',
    name: 'Tablets & Laptops',
    toxicity_level: 4,
    color_hex: '#f97316', // Orange - High toxicity
    points: 50,
    icon: laptopIcon,
  },
  {
    id: 3,
    category: 'Batteries / Power Banks',
    name: 'Batteries & Power Banks',
    toxicity_level: 5,
    color_hex: '#dc2626', // Red - Very high toxicity
    points: 35,
    icon: batteryIcon,
  },
  {
    id: 4,
    category: 'Cables / Chargers',
    name: 'Cables & Chargers',
    toxicity_level: 1,
    color_hex: '#16a34a', // Green - Safe
    points: 10,
    icon: cableIcon,
  },
  {
    id: 5,
    category: 'Small Appliances',
    name: 'Small Appliances (<5kg)',
    toxicity_level: 3,
    color_hex: '#f59e0b', // Yellow - Medium toxicity
    points: 40,
    icon: applianceIcon,
  },
  {
    id: 6,
    category: 'Light Bulbs / LEDs',
    name: 'Light Bulbs & LEDs',
    toxicity_level: 2,
    color_hex: '#84cc16', // Light green - Low toxicity
    points: 15,
    icon: lightbulbIcon,
  },
];

export const getToxicityColor = (level: number): string => {
  const colors = {
    1: 'text-toxicity-1', // Safe - Green
    2: 'text-toxicity-2', // Low - Light Green  
    3: 'text-toxicity-3', // Medium - Yellow
    4: 'text-toxicity-4', // High - Orange
    5: 'text-toxicity-5', // Very High - Red
  };
  return colors[level as keyof typeof colors] || 'text-toxicity-1';
};

export const getToxicityBgColor = (level: number): string => {
  const colors = {
    1: 'bg-toxicity-1', // Safe - Green
    2: 'bg-toxicity-2', // Low - Light Green  
    3: 'bg-toxicity-3', // Medium - Yellow
    4: 'bg-toxicity-4', // High - Orange
    5: 'bg-toxicity-5', // Very High - Red
  };
  return colors[level as keyof typeof colors] || 'bg-toxicity-1';
};

export const getToxicityLabel = (level: number): string => {
  const labels = {
    1: 'Safe',
    2: 'Low Risk',
    3: 'Medium Risk',
    4: 'High Risk',
    5: 'Very High Risk',
  };
  return labels[level as keyof typeof labels] || 'Safe';
};