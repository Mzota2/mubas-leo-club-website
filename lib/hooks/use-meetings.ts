"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMeetings, getMeeting, createMeeting, updateMeeting, deleteMeeting } from "@/lib/firebase/firestore"
import type { Meeting } from "@/lib/types"

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => getMeetings(),
  })
}

export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => getMeeting(meetingId),
    enabled: !!meetingId,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] })
    },
  })
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: Partial<Meeting> }) => updateMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] })
    },
  })
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] })
    },
  })
}
