// Bin data store for admin management

export interface BinLocation {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  qrCode: string
  status: 'active' | 'inactive'
  capacity: number
  currentFill: number
  retailer: string
  contactPhone: string
  operatingHours: string
  materials: string[] // Risk levels accepted
  acceptedItems: {
    [key: string]: string[]
  }
  rewardRate: number
  totalDrops: number
  lastMaintenance: string
  createdAt?: string
}

// In-memory store (in production, use a database)
const bins: BinLocation[] = [
  {
    id: "bin_001",
    name: "Kikalisvili Recycling Station",
    address: "Kikalisvili Street, Zugdidi, Georgia",
    coordinates: {
      lat: 42.5092,
      lng: 41.8709
    },
    qrCode: "RELOOP_BIN_001_KIKALISVILI_2024",
    status: "active",
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
    totalDrops: 127,
    rewardRate: 0.5,
    lastMaintenance: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "bin_002",
    name: "Trade Center Mall",
    address: "Trade Center, Zugdidi, Georgia",
    coordinates: {
      lat: 42.5085,
      lng: 41.8720
    },
    qrCode: "RELOOP_BIN_002_TRADECENTER_2024",
    status: "active",
    capacity: 120,
    currentFill: 67,
    retailer: "GreenTech Solutions",
    contactPhone: "+995 415 12 34 57",
    operatingHours: "08:00 - 22:00",
    materials: ["level1", "level2", "level3", "level4"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"],
      level4: ["Laptops", "Tablets", "Gaming devices", "Monitors"]
    },
    totalDrops: 89,
    rewardRate: 0.6,
    lastMaintenance: "2024-01-18T14:30:00Z",
    createdAt: "2024-01-05T10:00:00Z"
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
    status: "inactive",
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
    totalDrops: 203,
    rewardRate: 0.4,
    lastMaintenance: "2024-01-20T09:15:00Z",
    createdAt: "2024-01-02T10:00:00Z"
  },
  {
    id: "bin_004",
    name: "University Campus Recycling Point",
    address: "Shota Rustaveli State University, Zugdidi, Georgia",
    coordinates: {
      lat: 42.5105,
      lng: 41.8735
    },
    qrCode: "RELOOP_BIN_004_UNIVERSITY_2024",
    status: "inactive",
    capacity: 150,
    currentFill: 0,
    retailer: "Campus Green Initiative",
    contactPhone: "+995 415 12 34 59",
    operatingHours: "24/7",
    materials: ["level1", "level2", "level3", "level4", "level5"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"],
      level4: ["Laptops", "Tablets", "Gaming devices", "Monitors"],
      level5: ["Power banks", "Laptop batteries", "Electric tool batteries", "UPS batteries"]
    },
    totalDrops: 45,
    rewardRate: 0.7,
    lastMaintenance: "2024-01-22T11:00:00Z",
    createdAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "bin_005",
    name: "Market Square Collection Point",
    address: "Central Market Square, Zugdidi, Georgia",
    coordinates: {
      lat: 42.5078,
      lng: 41.8705
    },
    qrCode: "RELOOP_BIN_005_MARKET_2024",
    status: "inactive",
    capacity: 90,
    currentFill: 12,
    retailer: "Market Vendors Association",
    contactPhone: "+995 415 12 34 60",
    operatingHours: "06:00 - 18:00",
    materials: ["level1", "level2", "level3"],
    acceptedItems: {
      level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
      level2: ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"],
      level3: ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"]
    },
    totalDrops: 156,
    rewardRate: 0.45,
    lastMaintenance: "2024-01-25T08:45:00Z",
    createdAt: "2024-01-08T10:00:00Z"
  }
]

// CRUD operations
export function getBins(): BinLocation[] {
  return bins
}

export function getBinById(id: string): BinLocation | undefined {
  return bins.find(bin => bin.id === id)
}

export function addBin(binData: Omit<BinLocation, 'id' | 'createdAt'>): BinLocation {
  const newBin: BinLocation = {
    id: `bin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ...binData,
    createdAt: new Date().toISOString()
  }
  
  bins.push(newBin)
  return newBin
}

export function updateBin(id: string, updateData: Partial<BinLocation>): BinLocation | null {
  const binIndex = bins.findIndex(bin => bin.id === id)
  
  if (binIndex === -1) {
    return null
  }
  
  bins[binIndex] = { ...bins[binIndex], ...updateData }
  return bins[binIndex]
}

export function deleteBin(id: string): boolean {
  const binIndex = bins.findIndex(bin => bin.id === id)
  
  if (binIndex === -1) {
    return false
  }
  
  bins.splice(binIndex, 1)
  return true
}

// Statistics functions
export function getBinStats() {
  const totalBins = bins.length
  const activeBins = bins.filter(bin => bin.status === 'active').length
  const inactiveBins = bins.filter(bin => bin.status === 'inactive').length
  const totalDrops = bins.reduce((sum, bin) => sum + bin.totalDrops, 0)
  const totalCapacity = bins.reduce((sum, bin) => sum + bin.capacity, 0)
  const totalCurrentFill = bins.reduce((sum, bin) => sum + bin.currentFill, 0)
  const averageFillPercentage = totalCapacity > 0 ? (totalCurrentFill / totalCapacity * 100) : 0
  
  // Bins that need maintenance (over 90% full)
  const binsNeedingAttention = bins.filter(bin => 
    bin.status === 'active' && (bin.currentFill / bin.capacity * 100) > 90
  )
  
  // Most popular bins
  const popularBins = [...bins]
    .sort((a, b) => b.totalDrops - a.totalDrops)
    .slice(0, 3)
  
  return {
    totalBins,
    activeBins,
    inactiveBins,
    totalDrops,
    totalCapacity,
    totalCurrentFill,
    averageFillPercentage: Math.round(averageFillPercentage * 100) / 100,
    binsNeedingAttention,
    popularBins
  }
}
