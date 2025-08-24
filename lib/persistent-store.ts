// File-based persistence for development
import fs from 'fs'
import path from 'path'
import { Drop, Notification } from './data-store'

const DATA_DIR = path.join(process.cwd(), '.data')
const DROPS_FILE = path.join(DATA_DIR, 'drops.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(DROPS_FILE)) {
  fs.writeFileSync(DROPS_FILE, JSON.stringify({ drops: [], dropIdCounter: 1 }))
}

if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications: [], notificationIdCounter: 1 }))
}

export const persistentStore = {
  // Drops
  getDrops: (): { drops: Drop[], dropIdCounter: number } => {
    try {
      const data = fs.readFileSync(DROPS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading drops file:', error)
      return { drops: [], dropIdCounter: 1 }
    }
  },

  saveDrops: (data: { drops: Drop[], dropIdCounter: number }) => {
    try {
      fs.writeFileSync(DROPS_FILE, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error saving drops file:', error)
    }
  },

  // Notifications
  getNotifications: (): { notifications: Notification[], notificationIdCounter: number } => {
    try {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading notifications file:', error)
      return { notifications: [], notificationIdCounter: 1 }
    }
  },

  saveNotifications: (data: { notifications: Notification[], notificationIdCounter: number }) => {
    try {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error saving notifications file:', error)
    }
  }
}
