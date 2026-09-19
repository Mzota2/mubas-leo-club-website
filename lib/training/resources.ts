import type { TrainingResourceType } from "@/lib/types"

export const LIONS_CLUB_DEFAULT_URL = "https://www.lionsclubs.org/"

export function isLionsClubResource(type?: string | null) {
  return type === "lionsclubinternational" || type === "lionsclub"
}

export function resourceUrlPlaceholder(type: TrainingResourceType) {
  if (isLionsClubResource(type)) return "https://www.lionsclubs.org/..."
  if (type === "youtube") return "https://youtube.com/watch?v=..."
  if (type === "article") return "Optional article link (https://...)"
  return "https://.../video.mp4"
}
