"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAttendance, getUserAttendance, createAttendance, updateAttendance, bulkCreateAttendance } from "@/lib/firebase/firestore"
import type { Attendance } from "@/lib/types"

export function useAttendance(meetingId: string) {
  return useQuery({
    queryKey: ["attendance", meetingId],
    queryFn: () => getAttendance(meetingId),
    enabled: !!meetingId,
  })
}

export function useUserAttendance(userId: string) {
  return useQuery({
    queryKey: ["userAttendance", userId],
    queryFn: () => getUserAttendance(userId),
    enabled: !!userId,
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: ["userAttendance", variables.userId] })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendanceId, data }: { attendanceId: string; data: Partial<Attendance> }) => {
      return updateAttendance(attendanceId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["userAttendance"] })
    },
  })
}

export function useBulkCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkCreateAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["userAttendance"] })
    },
  })
}
