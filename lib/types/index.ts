export type UserRole = "public" | "member" | "leader" | "admin"

export interface User {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  username: string
  email: string
  phone: string
  dateOfBirth: string
  profileImage?: string
  role: UserRole
  leoId?: string
  membershipStatus?: "active" | "inactive" | "suspended"
  position?: string
  region?: string
  zone?: string
  joinedDate?: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  category: "health" | "environment" | "community" | "meeting" | "fundraising" | "social"
  date: string
  time: string
  location: string
  image: string
  status: "upcoming" | "ongoing" | "completed"
  attendees?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: "tshirt" | "golfshirt" | "cap" | "mug" | "calendar"
  price: number
  images: string[]
  stock: number
  sizes?: string[]
  colors?: string[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  shippingAddress: string
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  userId?: string
  amount: number
  donorName: string
  donorEmail: string
  message?: string
  txRef?: string
  currency?: string
  paymentStatus: "pending" | "completed" | "failed"
  fiscalYear: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "birthday" | "event" | "general" | "announcement"
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Leader {
  id: string
  name: string
  position: string
  bio: string
  image: string
  email: string
  phone?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}

export interface Training {
  id: string
  title: string
  description: string
  videoUrl?: string
  documentUrl?: string
  category: string
  duration?: string
  createdAt: string
}

export interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
  eventId?: string
  uploadedBy: string
  createdAt: string
}

export interface PlatformSettings {
  clubName: string
  clubEmail: string
  clubPhone: string
  clubAddress: string
  notifications: {
    eventReminders: boolean
    birthdayNotifications: boolean
    paymentNotifications: boolean
  }
  updatedAt: string
}
