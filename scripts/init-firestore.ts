import { collection, doc, setDoc, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase/config"

// Sample data for initial database setup
const sampleProducts = [
  {
    id: "tshirt-black",
    name: "Black Leo Club T-Shirt",
    description: "Premium quality cotton t-shirt with Leo Club logo. Perfect for events and daily wear.",
    category: "tshirt",
    price: 15000,
    images: ["/placeholder.svg"],
    stock: 50,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tshirt-yellow",
    name: "Yellow Leo Club T-Shirt",
    description: "Vibrant yellow t-shirt featuring the Leo Club emblem.",
    category: "tshirt",
    price: 15000,
    images: ["/placeholder.svg"],
    stock: 45,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Yellow"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "golfshirt-black",
    name: "Black Golf Shirt",
    description: "Professional golf shirt with embroidered Leo Club logo.",
    category: "golfshirt",
    price: 25000,
    images: ["/placeholder.svg"],
    stock: 30,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "golfshirt-green",
    name: "Green Golf Shirt",
    description: "Classic green polo shirt perfect for formal club events.",
    category: "golfshirt",
    price: 25000,
    images: ["/placeholder.svg"],
    stock: 25,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Green"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cap-maroon",
    name: "Leo Club Cap - Maroon",
    description: "Adjustable cap with embroidered Leo Club logo.",
    category: "cap",
    price: 8000,
    images: ["/placeholder.svg"],
    stock: 60,
    colors: ["Maroon"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mug-leo",
    name: "Leo Club Ceramic Mug",
    description: "11oz ceramic mug with Leo Club design.",
    category: "mug",
    price: 5000,
    images: ["/placeholder.svg"],
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "calendar-2025",
    name: "Leo Club Calendar 2025",
    description: "Annual calendar featuring club activities and events.",
    category: "calendar",
    price: 3000,
    images: ["/placeholder.svg"],
    stock: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const sampleEvents = [
  {
    id: "blood-donation-2025",
    title: "Blood Donation Drive",
    description:
      "Join us for our annual blood donation campaign at Community Hospital. Help save lives by donating blood.",
    category: "health",
    date: "2025-07-15",
    time: "09:00 AM",
    location: "Community Hospital, Blantyre",
    image: "/images/home-20-20screen.jpg",
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tree-planting-2025",
    title: "Tree Planting Campaign",
    description: "Environmental conservation initiative. Plant trees and help restore our natural ecosystem.",
    category: "environment",
    date: "2025-07-22",
    time: "07:00 AM",
    location: "Michiru Mountain, Blantyre",
    image: "/tree-planting-cleanup.jpg",
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "youth-workshop-2025",
    title: "Youth Leadership Workshop",
    description: "Leadership and skills development workshop for young people in our community.",
    category: "community",
    date: "2025-08-05",
    time: "02:00 PM",
    location: "MUBAS Main Hall",
    image: "/youth-workshop-leadership.jpg",
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "clean-mubas-2025",
    title: "Clean MUBAS Initiative",
    description: "Community clean-up day at MUBAS campus. Join us in keeping our environment clean.",
    category: "environment",
    date: "2025-08-12",
    time: "08:00 AM",
    location: "MUBAS Campus",
    image: "/community-cleanup-volunteers.png",
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const sampleLeaders = [
  {
    id: "leo-mzota",
    name: "Leo Mzota",
    position: "Membership Chair",
    bio: "Passionate about youth empowerment and community development. Leading membership growth initiatives.",
    image: "/professional-male-headshot.png",
    email: "leo.mzota@mubasleoclub.org",
    phone: "+265 981 81 93 89",
  },
  {
    id: "jane-banda",
    name: "Jane Banda",
    position: "President",
    bio: "Dedicated leader with a vision for expanding our community impact and fostering youth leadership.",
    image: "/professional-headshot-female.png",
    email: "jane.banda@mubasleoclub.org",
  },
  {
    id: "john-phiri",
    name: "John Phiri",
    position: "Vice President",
    bio: "Committed to organizing impactful service projects and building strong community partnerships.",
    image: "/professional-headshot-male-2.png",
    email: "john.phiri@mubasleoclub.org",
  },
  {
    id: "grace-chirwa",
    name: "Grace Chirwa",
    position: "Secretary",
    bio: "Ensuring smooth operations and effective communication within the club and with external stakeholders.",
    image: "/professional-headshot-female-2.png",
    email: "grace.chirwa@mubasleoclub.org",
  },
]

async function initializeFirestore() {
  console.log("Initializing Firestore with sample data...")

  try {
    // Check if products already exist
    const productsSnapshot = await getDocs(collection(db, "products"))
    if (productsSnapshot.empty) {
      console.log("Adding sample products...")
      for (const product of sampleProducts) {
        await setDoc(doc(db, "products", product.id), product)
      }
      console.log(`Added ${sampleProducts.length} products`)
    } else {
      console.log("Products already exist, skipping...")
    }

    // Check if events already exist
    const eventsSnapshot = await getDocs(collection(db, "events"))
    if (eventsSnapshot.empty) {
      console.log("Adding sample events...")
      for (const event of sampleEvents) {
        await setDoc(doc(db, "events", event.id), event)
      }
      console.log(`Added ${sampleEvents.length} events`)
    } else {
      console.log("Events already exist, skipping...")
    }

    // Check if leaders already exist
    const leadersSnapshot = await getDocs(collection(db, "leaders"))
    if (leadersSnapshot.empty) {
      console.log("Adding sample leaders...")
      for (const leader of sampleLeaders) {
        await setDoc(doc(db, "leaders", leader.id), leader)
      }
      console.log(`Added ${sampleLeaders.length} leaders`)
    } else {
      console.log("Leaders already exist, skipping...")
    }

    console.log("Firestore initialization complete!")
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  initializeFirestore()
    .then(() => {
      console.log("Success!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Failed:", error)
      process.exit(1)
    })
}

export { initializeFirestore }
