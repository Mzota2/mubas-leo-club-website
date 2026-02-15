"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "@/lib/firebase/firestore"
import { where, orderBy } from "firebase/firestore"
import type { Event } from "@/lib/types"

export function useEvents(category?: string, status?: string) {
  return useQuery({
    queryKey: ["events", category, status],
    queryFn: async () => {
      const constraints = []
      if (category) constraints.push(where("category", "==", category))
      if (status) constraints.push(where("status", "==", status))
      constraints.push(orderBy("date", "desc"))
      return getEvents(constraints)
    },
  })
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<Event> }) => updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
