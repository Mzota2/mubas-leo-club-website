export function isViewer(id?: string | null, viewerId?: string | null) {
  return Boolean(id && viewerId && id === viewerId)
}

export function withoutViewer<T extends { id?: string; memberId?: string; userId?: string }>(
  items: T[] | undefined,
  viewerId?: string | null,
): T[] {
  if (!items?.length) return items ?? []
  if (!viewerId) return items
  return items.filter((item) => (item.id ?? item.memberId ?? item.userId) !== viewerId)
}
