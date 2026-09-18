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
  writeBatch,
  increment,
  type QueryConstraint,
} from "firebase/firestore"
import { auth, db } from "./config"
import { generateLeoId } from "@/lib/utils/leo-id"
import type { User, Event, Product, Order, Donation, Notification, Leader, Training, GalleryImage, PlatformSettings, DonationCause, MembershipFee, Meeting, Attendance, TrainingModule, TrainingProgress } from "@/lib/types"

function omitUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T
}

async function ensureAuthToken() {
  if (auth.currentUser) {
    await auth.currentUser.getIdToken()
  }
}

// User operations
export async function createUser(userId: string, userData: Omit<User, "id" | "leoId" | "membershipType"> & { leoId?: string; membershipType?: "leo" | "prospective-leo" }) {
  await ensureAuthToken()
  const leoId = userData.leoId || generateLeoId(userId)
  const membershipType = userData.membershipType || "prospective-leo"
  const membershipStatus = userData.membershipStatus || "pending"

  await setDoc(
    doc(db, "users", userId),
    omitUndefined({
      ...userData,
      role: "member",
      leoId,
      membershipType,
      membershipStatus,
      trainingStatus: userData.trainingStatus ?? "pending",
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    } as Record<string, unknown>),
  )
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", userId))
  if (!userDoc.exists()) return null
  return { id: userDoc.id, ...userDoc.data() } as User
}

export async function updateUser(userId: string, userData: Partial<User>) {
  await ensureAuthToken()
  await updateDoc(
    doc(db, "users", userId),
    omitUndefined({
      ...userData,
      updatedAt: Timestamp.now().toDate().toISOString(),
    } as Record<string, unknown>),
  )
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
  const now = Timestamp.now().toDate().toISOString()
  const docRef = await addDoc(collection(db, "orders"), {
    ...omitUndefined(orderData as Record<string, unknown>),
    createdAt: orderData.createdAt || now,
    updatedAt: now,
  })
  return docRef.id
}

export async function getOrders(userId?: string) {
  const ordersQuery = userId
    ? query(collection(db, "orders"), where("userId", "==", userId))
    : query(collection(db, "orders"))
  const ordersSnapshot = await getDocs(ordersQuery)
  return ordersSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Order)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
}

export async function getUserOrders(userId: string) {
  return getOrders(userId)
}

export async function getOrderByTxRef(txRef: string): Promise<Order | null> {
  const ordersQuery = query(collection(db, "orders"), where("txRef", "==", txRef))
  const snapshot = await getDocs(ordersQuery)
  if (snapshot.empty) return null
  const item = snapshot.docs[0]
  return { id: item.id, ...item.data() } as Order
}

export async function updateOrder(orderId: string, orderData: Partial<Order>) {
  await updateDoc(doc(db, "orders", orderId), {
    ...omitUndefined(orderData as Record<string, unknown>),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

// Donation operations
export async function createDonation(donationData: Omit<Donation, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, "donations"), {
    ...omitUndefined(donationData as Record<string, unknown>),
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
  return donationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Donation)
}

export async function getDonationByTxRef(txRef: string): Promise<Donation | null> {
  const donationsQuery = query(collection(db, "donations"), where("txRef", "==", txRef))
  const snapshot = await getDocs(donationsQuery)
  if (snapshot.empty) return null
  const item = snapshot.docs[0]
  return { id: item.id, ...item.data() } as Donation
}

export async function getDonationsForUser(userId: string, email?: string) {
  const byUser = query(collection(db, "donations"), where("userId", "==", userId))
  const userSnapshot = await getDocs(byUser)
  const donations = userSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Donation)

  if (email) {
    try {
      const byEmail = query(collection(db, "donations"), where("donorEmail", "==", email))
      const emailSnapshot = await getDocs(byEmail)
      for (const item of emailSnapshot.docs) {
        if (!donations.some((donation) => donation.id === item.id)) {
          donations.push({ id: item.id, ...item.data() } as Donation)
        }
      }
    } catch {
      // Email lookup is best-effort if a donor record has no userId.
    }
  }

  return donations.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
}

export async function incrementDonationCauseAmount(causeId: string, amount: number) {
  await updateDoc(doc(db, "donationCauses", causeId), {
    currentAmount: increment(amount),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

// Donation Cause operations
export async function getDonationCauses(activeOnly: boolean = false) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]
  if (activeOnly) {
    constraints.unshift(where("isActive", "==", true))
  }
  const causesQuery = query(collection(db, "donationCauses"), ...constraints)
  const causesSnapshot = await getDocs(causesQuery)
  return causesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as DonationCause)
}

export async function getDonationCause(causeId: string): Promise<DonationCause | null> {
  const causeDoc = await getDoc(doc(db, "donationCauses", causeId))
  if (!causeDoc.exists()) return null
  return { id: causeDoc.id, ...causeDoc.data() } as DonationCause
}

export async function createDonationCause(causeData: Omit<DonationCause, "id">) {
  const docRef = await addDoc(collection(db, "donationCauses"), {
    ...causeData,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateDonationCause(causeId: string, causeData: Partial<DonationCause>) {
  await updateDoc(doc(db, "donationCauses", causeId), {
    ...causeData,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function deleteDonationCause(causeId: string) {
  await deleteDoc(doc(db, "donationCauses", causeId))
}

// Membership Fee operations
export async function getMembershipFees(userId?: string) {
  const feesQuery = userId
    ? query(collection(db, "membershipFees"), where("userId", "==", userId))
    : query(collection(db, "membershipFees"))
  const feesSnapshot = await getDocs(feesQuery)
  return feesSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as MembershipFee)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
}

export async function getMembershipFeeByTxRef(txRef: string): Promise<MembershipFee | null> {
  const feesQuery = query(collection(db, "membershipFees"), where("txRef", "==", txRef))
  const snapshot = await getDocs(feesQuery)
  if (snapshot.empty) return null
  const item = snapshot.docs[0]
  return { id: item.id, ...item.data() } as MembershipFee
}

export async function createMembershipFee(feeData: Omit<MembershipFee, "id">) {
  const docRef = await addDoc(collection(db, "membershipFees"), {
    ...omitUndefined(feeData as Record<string, unknown>),
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateMembershipFee(feeId: string, feeData: Partial<MembershipFee>) {
  await updateDoc(doc(db, "membershipFees", feeId), feeData)
}

// Meeting operations
export async function getMeetings() {
  const meetingsQuery = query(collection(db, "meetings"), orderBy("date", "desc"))
  const meetingsSnapshot = await getDocs(meetingsQuery)
  return meetingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Meeting)
}

export async function getMeeting(meetingId: string): Promise<Meeting | null> {
  const meetingDoc = await getDoc(doc(db, "meetings", meetingId))
  if (!meetingDoc.exists()) return null
  return { id: meetingDoc.id, ...meetingDoc.data() } as Meeting
}

export async function createMeeting(meetingData: Omit<Meeting, "id">) {
  const docRef = await addDoc(collection(db, "meetings"), {
    ...meetingData,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateMeeting(meetingId: string, meetingData: Partial<Meeting>) {
  await updateDoc(doc(db, "meetings", meetingId), {
    ...meetingData,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function deleteMeeting(meetingId: string) {
  await deleteDoc(doc(db, "meetings", meetingId))
}

// Attendance operations
export async function getAttendance(meetingId: string) {
  const attendanceQuery = query(collection(db, "attendance"), where("meetingId", "==", meetingId))
  const attendanceSnapshot = await getDocs(attendanceQuery)
  return attendanceSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Attendance)
}

export async function getUserAttendance(userId: string) {
  const attendanceQuery = query(collection(db, "attendance"), where("userId", "==", userId), orderBy("createdAt", "desc"))
  const attendanceSnapshot = await getDocs(attendanceQuery)
  return attendanceSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Attendance)
}

export async function createAttendance(attendanceData: Omit<Attendance, "id">) {
  const docRef = await addDoc(collection(db, "attendance"), {
    ...attendanceData,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateAttendance(attendanceId: string, attendanceData: Partial<Attendance>) {
  await updateDoc(doc(db, "attendance", attendanceId), attendanceData)
}

export async function bulkCreateAttendance(attendanceRecords: Omit<Attendance, "id">[]) {
  const batch = writeBatch(db)
  const attendanceRef = collection(db, "attendance")
  
  attendanceRecords.forEach((record) => {
    const docRef = doc(attendanceRef)
    batch.set(docRef, {
      ...record,
      createdAt: Timestamp.now().toDate().toISOString(),
    })
  })
  
  await batch.commit()
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

function isoNow() {
  return Timestamp.now().toDate().toISOString()
}

export async function getTrainingModules() {
  const modulesQuery = query(collection(db, "trainingModules"), orderBy("order", "asc"))
  const snapshot = await getDocs(modulesQuery)
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TrainingModule)
}

export async function getTrainingModule(moduleId: string): Promise<TrainingModule | null> {
  const snapshot = await getDoc(doc(db, "trainingModules", moduleId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as TrainingModule
}

export async function createTrainingModule(data: Omit<TrainingModule, "id" | "createdAt" | "updatedAt">) {
  const now = isoNow()
  const docRef = await addDoc(collection(db, "trainingModules"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function updateTrainingModule(moduleId: string, data: Partial<TrainingModule>) {
  await updateDoc(doc(db, "trainingModules", moduleId), {
    ...data,
    updatedAt: isoNow(),
  })
}

export async function deleteTrainingModule(moduleId: string) {
  await deleteDoc(doc(db, "trainingModules", moduleId))
}

export async function getTrainingProgress(userId: string): Promise<TrainingProgress | null> {
  const snapshot = await getDoc(doc(db, "trainingProgress", userId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as TrainingProgress
}

export async function getAllTrainingProgress() {
  const snapshot = await getDocs(collection(db, "trainingProgress"))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TrainingProgress)
}

export async function upsertTrainingProgress(userId: string, data: Partial<TrainingProgress>) {
  const now = isoNow()
  const existing = await getTrainingProgress(userId)
  await setDoc(
    doc(db, "trainingProgress", userId),
    {
      userId,
      xp: existing?.xp ?? 0,
      badges: existing?.badges ?? [],
      completedModuleIds: existing?.completedModuleIds ?? [],
      viewedResourceIds: existing?.viewedResourceIds ?? [],
      quizAttempts: existing?.quizAttempts ?? [],
      status: existing?.status ?? "not_started",
      createdAt: existing?.createdAt ?? now,
      ...data,
      updatedAt: now,
    },
    { merge: true },
  )
}
