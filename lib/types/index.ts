export type UserRole = "public" | "member" | "leader" | "admin"
export type MembershipType = "leo" | "prospective-leo"
export type JoinIntent = "joining" | "existing"
export type MembershipStatus = "pending" | "active" | "inactive" | "suspended"
export type FeePeriod = "monthly" | "semester" | "yearly" | "joining"

export interface MembershipFee {
  id: string
  userId: string
  amount: number
  period: FeePeriod
  coverageStart: string
  coverageEnd: string
  paymentDate?: string
  dueDate: string
  status: "paid" | "pending" | "overdue"
  method?: "paychangu" | "offline"
  txRef?: string
  notes?: string
  recordedBy?: string
  createdAt: string
}

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
  membershipType: MembershipType
  leoId: string // Auto-generated, required
  joinIntent?: JoinIntent
  membershipStatus?: MembershipStatus
  position?: string
  region?: string
  zone?: string
  joinedDate?: string
  whatsappGroupLink?: string // For newly promoted leos
  trainingStatus?: "pending" | "completed" | "waived"
  trainingCompletedAt?: string
  joiningFeePaid?: boolean
  joiningFeePaidAt?: string
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

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal?: number
  deliveryFee?: number
  total: number
  currency?: string
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  txRef?: string
  customerName?: string
  customerEmail?: string
  phone?: string
  shippingAddress: string
  createdAt: string
  updatedAt: string
}

export interface DonationCause {
  id: string
  title: string
  description: string
  image?: string
  targetAmount?: number
  currentAmount: number
  isActive: boolean
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
  causeId?: string
  causeTitle?: string
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

export type TrainingResourceType = "youtube" | "video" | "article"

export interface TrainingResource {
  id: string
  type: TrainingResourceType
  title: string
  url?: string
  body?: string
}

export interface TrainingQuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  order: number
  xp: number
  isPublished: boolean
  resources: TrainingResource[]
  quiz: {
    passingScore: number
    questions: TrainingQuizQuestion[]
  }
  createdAt: string
  updatedAt: string
}

export interface TrainingQuizAttempt {
  moduleId: string
  score: number
  passed: boolean
  attemptedAt: string
}

export interface TrainingProgress {
  id: string
  userId: string
  xp: number
  badges: string[]
  completedModuleIds: string[]
  viewedResourceIds: string[]
  quizAttempts: TrainingQuizAttempt[]
  status: "not_started" | "in_progress" | "completed" | "waived"
  waived?: boolean
  waivedBy?: string
  waivedReason?: string
  waivedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
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

export interface MembershipBillingSettings {
  monthlyFee: number
  semesterFee: number
  yearlyFee: number
  joiningFee: number
  semesterStart: string
  semesterEnd: string
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
  membership?: MembershipBillingSettings
  updatedAt: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  time: string
  location: string
  description?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  meetingId: string
  userId: string
  status: "present" | "absent" | "excused"
  penalty?: {
    amount: number
    reason: string
    status: "pending" | "paid" | "waived"
    dueDate: string
  }
  notes?: string
  createdAt: string
}

export interface AttendanceRecord {
  meeting: Meeting
  attendees: Array<{
    user: User
    attendance: Attendance
  }>
  absentees: Array<{
    user: User
    attendance: Attendance
  }>
  excused: Array<{
    user: User
    attendance: Attendance
  }>
}
