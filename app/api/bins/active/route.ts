import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get bins from Supabase database
export async function GET() {
  try {
    const { data: bins, error } = await supabase
      .from('bins')
      .select('*')
      .eq('is_active', true)
      .eq('is_operational', true)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      bins: bins || []
    })
  } catch (error) {
    console.error('Error fetching active bins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load bin locations' },
      { status: 500 }
    )
  }
}

// Legacy hardcoded data (kept for reference)
const legacyBinLocations = [
  {
    id: "bin_001",
    name: "Kikalisvili Recycling Station",
    address: "Kikalisvili Street, Zugdidi, Georgia",
    coordinates: { 
      lat: 42.5092, 
      lng: 41.8709 
    },
    qrCode: "RELOOP_BIN_001_KIKALISVILI_2024",
    status: "active" as const,
    totalDrops: 127,
    capacity: 100,
    currentFill: 35,
    retailer: "EcoTech Georgia",
    contactPhone: "+995 415 12 34 56",
    operatingHours: "24/7",
    materials: ["level1", "level2", "level3"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"]
    },
    lastMaintenance: "2024-01-15T10:00:00Z",
    rewardRate: 0.5 // ADA per kg
  },
  {
    id: "bin_002", 
    name: "Trade Center Mall Recycling Hub",
    address: "Trade Center Mall, Central Zugdidi, Georgia",
    coordinates: { 
      lat: 42.5115, 
      lng: 41.8755 
    },
    qrCode: "RELOOP_BIN_002_TRADECENTER_2024",
    status: "active" as const,
    totalDrops: 89,
    capacity: 150,
    currentFill: 62,
    retailer: "GreenPoint Solutions",
    contactPhone: "+995 415 12 34 57",
    operatingHours: "09:00 - 22:00",
    materials: ["level1", "level2", "level3", "level4"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"],
      level4: ["Laptops", "Tablets", "Gaming devices", "Monitors"]
    },
    lastMaintenance: "2024-01-18T14:30:00Z",
    rewardRate: 0.6 // ADA per kg
  },
  {
    id: "bin_003",
    name: "Central Park Green Station", 
    address: "Central Park, Zugdidi, Georgia",
    coordinates: { 
      lat: 42.5068, 
      lng: 41.8698 
    },
    qrCode: "RELOOP_BIN_003_CENTRALPARK_2024",
    status: "inactive" as const,
    totalDrops: 203,
    capacity: 80,
    currentFill: 18,
    retailer: "EcoCycle Zugdidi",
    contactPhone: "+995 415 12 34 58",
    operatingHours: "06:00 - 20:00",
    materials: ["level1", "level2"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"]
    },
    lastMaintenance: "2024-01-20T09:15:00Z",
    rewardRate: 0.4 // ADA per kg
  },
  {
    id: "bin_004",
    name: "University Campus Recycling Point",
    address: "Shota Rustaveli State University, Zugdidi, Georgia", 
    coordinates: { 
      lat: 42.5145, 
      lng: 41.8722 
    },
    qrCode: "RELOOP_BIN_004_UNIVERSITY_2024",
    status: "inactive" as const,
    totalDrops: 156,
    capacity: 120,
    currentFill: 43,
    retailer: "TechRecycle Academy",
    contactPhone: "+995 415 12 34 59",
    operatingHours: "08:00 - 18:00",
    materials: ["level1", "level2", "level3", "level4", "level5"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"],
      level4: ["Laptops", "Tablets", "Gaming devices", "Monitors"],
      level5: ["Power banks", "Laptop batteries", "Electric tool batteries", "UPS batteries"]
    },
    lastMaintenance: "2024-01-17T16:00:00Z",
    rewardRate: 0.55 // ADA per kg
  },
  {
    id: "bin_005",
    name: "Market Square Collection Point",
    address: "Main Market Square, Zugdidi, Georgia",
    coordinates: { 
      lat: 42.5101, 
      lng: 41.8734 
    },
    qrCode: "RELOOP_BIN_005_MARKET_2024", 
    status: "inactive" as const,
    totalDrops: 74,
    capacity: 90,
    currentFill: 28,
    retailer: "SafeDisposal Ltd",
    contactPhone: "+995 415 12 34 60",
    operatingHours: "07:00 - 19:00",
    materials: ["level1", "level2", "level3"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"]
    },
    lastMaintenance: "2024-01-19T11:45:00Z",
    rewardRate: 0.45 // ADA per kg
  }
]
