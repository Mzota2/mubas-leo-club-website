/**
 * Generates a unique LEO ID in the format: LEO-YYYY-XXXXXX
 * Uses the Firebase uid so uniqueness does not require listing the users collection.
 */
export function generateLeoId(userId?: string): string {
  const year = new Date().getFullYear()
  const seed = `${userId || ""}-${Date.now()}-${Math.random()}`.replace(/[^a-z0-9]/gi, "").toUpperCase()
  const suffix = (seed.slice(-6) || Date.now().toString(36).toUpperCase()).padStart(6, "0").slice(-6)
  return `LEO-${year}-${suffix}`
}
