// Persistent data store for development (in production, use a database)
import { persistentStore } from './persistent-store'

export interface Drop {
  id: string
  userId: string
  userEmail: string
  binId: string
  itemType: string
  itemDescription: string
  estimatedTokens: number
  actualTokens: number | null
  photo: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  approvedAt: string | null
  approvedBy: string | null
  notes: string
}

export interface Notification {
  id: string
  userId: string
  userEmail: string
  type: 'drop_approved' | 'drop_rejected' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  dropId?: string
}

// Load data from persistent storage
const getDataStore = () => {
  const dropsData = persistentStore.getDrops()
  const notificationsData = persistentStore.getNotifications()
  
  return {
    drops: dropsData.drops,
    notifications: notificationsData.notifications,
    dropIdCounter: dropsData.dropIdCounter,
    notificationIdCounter: notificationsData.notificationIdCounter
  }
}

// Global data storage
export const dataStore = getDataStore()

// Helper functions
export const addDrop = (drop: Omit<Drop, 'id'>) => {
  // Reload current data
  const currentData = getDataStore()
  
  const newDrop: Drop = {
    ...drop,
    id: `drop_${currentData.dropIdCounter++}`
  }
  
  currentData.drops.push(newDrop)
  
  // Save to persistent storage
  persistentStore.saveDrops({
    drops: currentData.drops,
    dropIdCounter: currentData.dropIdCounter
  })
  
  // Update in-memory store
  dataStore.drops = currentData.drops
  dataStore.dropIdCounter = currentData.dropIdCounter
  
  return newDrop
}

export const updateDrop = (dropId: string, updates: Partial<Drop>) => {
  // Reload current data
  const currentData = getDataStore()
  
  const dropIndex = currentData.drops.findIndex(drop => drop.id === dropId)
  if (dropIndex === -1) return null
  
  currentData.drops[dropIndex] = { ...currentData.drops[dropIndex], ...updates }
  
  // Save to persistent storage
  persistentStore.saveDrops({
    drops: currentData.drops,
    dropIdCounter: currentData.dropIdCounter
  })
  
  // Update in-memory store
  dataStore.drops = currentData.drops
  
  return currentData.drops[dropIndex]
}

export const getDrop = (dropId: string) => {
  const currentData = getDataStore()
  return currentData.drops.find(drop => drop.id === dropId)
}

export const getUserDrops = (userId: string) => {
  const currentData = getDataStore()
  return currentData.drops.filter(drop => drop.userId === userId)
}

export const getDropsByStatus = (status?: string) => {
  const currentData = getDataStore()
  if (!status) return currentData.drops
  return currentData.drops.filter(drop => drop.status === status)
}

export const getAllDrops = () => {
  const currentData = getDataStore()
  return currentData.drops
}

export const addNotification = (notification: Omit<Notification, 'id'>) => {
  // Reload current data
  const currentData = getDataStore()
  
  const newNotification: Notification = {
    ...notification,
    id: `notif_${currentData.notificationIdCounter++}`
  }
  
  currentData.notifications.push(newNotification)
  
  // Save to persistent storage
  persistentStore.saveNotifications({
    notifications: currentData.notifications,
    notificationIdCounter: currentData.notificationIdCounter
  })
  
  // Update in-memory store
  dataStore.notifications = currentData.notifications
  dataStore.notificationIdCounter = currentData.notificationIdCounter
  
  return newNotification
}

export const getUserNotifications = (userId: string) => {
  const currentData = getDataStore()
  return currentData.notifications
    .filter(notif => notif.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const markNotificationRead = (notificationId: string) => {
  const currentData = getDataStore()
  const notifIndex = currentData.notifications.findIndex(notif => notif.id === notificationId)
  if (notifIndex !== -1) {
    currentData.notifications[notifIndex].read = true
    
    // Save to persistent storage
    persistentStore.saveNotifications({
      notifications: currentData.notifications,
      notificationIdCounter: currentData.notificationIdCounter
    })
    
    // Update in-memory store
    dataStore.notifications = currentData.notifications
    
    return currentData.notifications[notifIndex]
  }
  return null
}
