import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "./config"
import type { User, Event, Product, Order, Donation, Notification, Leader, Training, GalleryImage, PlatformSettings } from "@/lib/types"

// User operations
export async function createUser(userId: string, userData: Omit<User, "id">) {
  await setDoc(doc(db, "users", userId), {
    ...userData,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", userId))
  if (!userDoc.exists()) return null
  return { id: userDoc.id, ...userDoc.data() } as User
}

export async function updateUser(userId: string, userData: Partial<User>) {
  await updateDoc(doc(db, "users", userId), {
    ...userData,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function getAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"))
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
}

// Event operations
export async function getEvents(constraints: QueryConstraint[] = []) {
  const eventsQuery = query(collection(db, "events"), ...constraints)
  const eventsSnapshot = await getDocs(eventsQuery)
  return eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Event)
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const eventDoc = await getDoc(doc(db, "events", eventId))
  if (!eventDoc.exists()) return null
  return { id: eventDoc.id, ...eventDoc.data() } as Event
}

export async function createEvent(eventData: Omit<Event, "id">) {
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateEvent(eventId: string, eventData: Partial<Event>) {
  await updateDoc(doc(db, "events", eventId), {
    ...eventData,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function deleteEvent(eventId: string) {
  await deleteDoc(doc(db, "events", eventId))
}

// Product operations
export async function getProducts(category?: string) {
  const constraints: QueryConstraint[] = []
  if (category) {
    constraints.push(where("category", "==", category))
  }
  const productsQuery = query(collection(db, "products"), ...constraints)
  const productsSnapshot = await getDocs(productsQuery)
  return productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
}

export async function getProduct(productId: string): Promise<Product | null> {
  const productDoc = await getDoc(doc(db, "products", productId))
  if (!productDoc.exists()) return null
  return { id: productDoc.id, ...productDoc.data() } as Product
}

// Order operations
export async function createOrder(orderData: Omit<Order, "id">) {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function getUserOrders(userId: string) {
  const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))
  const ordersSnapshot = await getDocs(ordersQuery)
  return ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
}

export async function updateOrder(orderId: string, orderData: Partial<Order>) {
  await updateDoc(doc(db, "orders", orderId), {
    ...orderData,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

// Donation operations
export async function createDonation(donationData: Omit<Donation, "id">) {
  const docRef = await addDoc(collection(db, "donations"), {
    ...donationData,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function getDonations(fiscalYear?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]
  if (fiscalYear) {
    constraints.unshift(where("fiscalYear", "==", fiscalYear))
  }
  const donationsQuery = query(collection(db, "donations"), ...constraints)
  const donationsSnapshot = await getDocs(donationsQuery)
  return donationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Donation)
}

// Notification operations
export async function getUserNotifications(userId: string) {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50),
  )
  const notificationsSnapshot = await getDocs(notificationsQuery)
  return notificationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)
}

export async function createNotification(notificationData: Omit<Notification, "id">) {
  await addDoc(collection(db, "notifications"), {
    ...notificationData,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  })
}

// Leader operations
export async function getLeaders() {
  const leadersSnapshot = await getDocs(collection(db, "leaders"))
  return leadersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Leader)
}

// Training operations
export async function getTrainings() {
  const trainingsSnapshot = await getDocs(collection(db, "trainings"))
  return trainingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Training)
}

// Gallery operations
export async function getGalleryImages(eventId?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]
  if (eventId) {
    constraints.unshift(where("eventId", "==", eventId))
  }
  const galleryQuery = query(collection(db, "gallery"), ...constraints)
  const gallerySnapshot = await getDocs(galleryQuery)
  return gallerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as GalleryImage)
}

export async function createGalleryImage(imageData: Omit<GalleryImage, "id">) {
  const docRef = await addDoc(collection(db, "gallery"), {
    ...imageData,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateGalleryImage(imageId: string, imageData: Partial<GalleryImage>) {
  await updateDoc(doc(db, "gallery", imageId), {
    ...imageData,
  })
}

export async function deleteGalleryImage(imageId: string) {
  await deleteDoc(doc(db, "gallery", imageId))
}

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  const settingsDoc = await getDoc(doc(db, "settings", "platform"))
  if (!settingsDoc.exists()) return null
  return settingsDoc.data() as PlatformSettings
}

export async function updatePlatformSettings(settings: Omit<PlatformSettings, "updatedAt">) {
  await setDoc(
    doc(db, "settings", "platform"),
    {
      ...settings,
      updatedAt: Timestamp.now().toDate().toISOString(),
    },
    { merge: true },
  )
}
