import type { Product } from "@/lib/types"
import { media } from "@/lib/media"

export type ShopCategoryId = Product["category"]

export type ShopProduct = Product & {
  hashtag: string
  accent: string
  surface: string
}

export type ShopCategory = {
  id: ShopCategoryId
  label: string
  description: string
}

const stamp = "2026-01-15T00:00:00.000Z"

function item(
  product: Omit<ShopProduct, "createdAt" | "updatedAt" | "stock"> & {
    stock?: number
  },
): ShopProduct {
  return {
    stock: 24,
    createdAt: stamp,
    updatedAt: stamp,
    ...product,
  }
}

export const shopCategories: ShopCategory[] = [
  {
    id: "tshirt",
    label: "T-shirts",
    description: "Club tees for events and everyday wear. Pick a colour, then add it to your cart.",
  },
  {
    id: "golfshirt",
    label: "Golf-Shirts",
    description: "Smart collared shirts for meetings, service days, and club representation.",
  },
  {
    id: "cap",
    label: "Caps",
    description: "Branded caps to keep the sun off during outreach and outdoor events.",
  },
  {
    id: "mug",
    label: "Mugs",
    description: "Leo Club mugs for the office, home, or as a simple gift.",
  },
]

export const shopProducts: ShopProduct[] = [
  item({
    id: "tshirt-green",
    name: "District 45 T-shirt",
    hashtag: "#Green T-shirt",
    description: "Forest green Leo District 45 tee with gold crest. Soft cotton, regular fit.",
    category: "tshirt",
    price: 15000,
    images: [media.merch.tshirtGreen],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Green"],
    accent: "#14532d",
    surface: "#f3f4f6",
  }),
  item({
    id: "tshirt-yellow",
    name: "Sussex Leo T-shirt",
    hashtag: "#Yellow T-shirt",
    description: "Gold Leo Club tee with maroon lettering. Bright enough for rallies and service days.",
    category: "tshirt",
    price: 15000,
    images: [media.merch.tshirtYellow],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow"],
    accent: "#d97706",
    surface: "#fff7ed",
  }),
  item({
    id: "tshirt-black",
    name: "Leo Sunset T-shirt",
    hashtag: "#Black T-shirt",
    description: "Black tee with a sunset Leo graphic. Limited club run.",
    category: "tshirt",
    price: 16000,
    images: [media.merch.tshirtBlack],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    accent: "#111827",
    surface: "#e5e7eb",
  }),
  item({
    id: "golf-black",
    name: "Black Golf Shirt",
    hashtag: "#Black Golf Shirt",
    description: "Black collared shirt with embroidered crest. For meetings and formal club days.",
    category: "golfshirt",
    price: 25000,
    images: [media.merch.golfBlack],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    accent: "#1f2937",
    surface: "#f3f4f6",
  }),
  item({
    id: "golf-green",
    name: "Green Golf Shirt",
    hashtag: "#Green Golf Shirt",
    description: "Forest green golf shirt with gold details. Comfortable knit collar.",
    category: "golfshirt",
    price: 25000,
    images: [media.merch.golfGreen],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Green"],
    accent: "#166534",
    surface: "#ecfdf5",
  }),
  item({
    id: "golf-white",
    name: "White Golf Shirt",
    hashtag: "#White Golf Shirt",
    description: "Clean white golf shirt with embroidered Lions crest. Easy to dress up or down.",
    category: "golfshirt",
    price: 25000,
    images: [media.merch.golfWhite],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    accent: "#e5e7eb",
    surface: "#f8fafc",
  }),
  item({
    id: "cap-red",
    name: "Club Leo Cap",
    hashtag: "#Club Cap",
    description: "Maroon cap with club leo lettering. Adjustable fit.",
    category: "cap",
    price: 8000,
    images: [media.merch.capRed],
    colors: ["Maroon"],
    accent: "#9f1239",
    surface: "#fff1f2",
  }),
  item({
    id: "cap-beige",
    name: "Sand Cap",
    hashtag: "#Sand Cap",
    description: "Light cap with Lions International mark. Breathable and easy to pack.",
    category: "cap",
    price: 8000,
    images: [media.merch.capBeige],
    colors: ["Beige"],
    accent: "#d6c3a3",
    surface: "#faf6f1",
  }),
  item({
    id: "cap-blue",
    name: "Blue Cap",
    hashtag: "#Blue Cap",
    description: "Royal blue cap with gold Lions crest. Everyday club wear.",
    category: "cap",
    price: 8000,
    images: [media.merch.capBlue],
    colors: ["Blue"],
    accent: "#1d4ed8",
    surface: "#eff6ff",
  }),
  item({
    id: "mug-stacked",
    name: "LED Club Mug",
    hashtag: "#Club Mug",
    description: "Black ceramic mug with stacked LEO lettering.",
    category: "mug",
    price: 7000,
    images: [media.merch.mugStacked],
    colors: ["Black"],
    accent: "#111827",
    surface: "#f3f4f6",
  }),
  item({
    id: "mug-lion",
    name: "Lion Crest Mug",
    hashtag: "#Lion Mug",
    description: "Grey mug with the Lions International crest and gold interior.",
    category: "mug",
    price: 7500,
    images: [media.merch.mugLion],
    colors: ["Grey"],
    accent: "#b45309",
    surface: "#fffbeb",
  }),
  item({
    id: "mug-leo-thing",
    name: "It's a Leo Thing Mug",
    hashtag: "#Leo Mug",
    description: "Black mug with the Leo lion mark. A simple club gift.",
    category: "mug",
    price: 7500,
    images: [media.merch.mugLeoThing],
    colors: ["Black"],
    accent: "#111827",
    surface: "#f3f4f6",
  }),
]

export function getShopCategory(id: string) {
  if (id === "offer") {
    return {
      id: "offer" as ShopCategoryId,
      label: "Special offers",
      description: "Limited campaigns and gift sets created by the club.",
    }
  }
  return shopCategories.find((category) => category.id === id)
}

export function getShopProduct(id: string) {
  return shopProducts.find((product) => product.id === id)
}

export function getProductsByCategory(id: ShopCategoryId) {
  return shopProducts.filter((product) => product.category === id)
}

export function searchShopProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return shopProducts
  return shopProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      product.hashtag.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q),
  )
}
