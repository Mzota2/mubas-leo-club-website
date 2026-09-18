"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTrainingModule,
  deleteTrainingModule,
  getAllTrainingProgress,
  getTrainingModule,
  getTrainingModules,
  getTrainingProgress,
  updateTrainingModule,
  upsertTrainingProgress,
} from "@/lib/firebase/firestore"
import type { TrainingModule, TrainingProgress } from "@/lib/types"

export function useTrainingModules() {
  return useQuery({
    queryKey: ["training-modules"],
    queryFn: getTrainingModules,
  })
}

export function useTrainingModule(moduleId: string) {
  return useQuery({
    queryKey: ["training-module", moduleId],
    queryFn: () => getTrainingModule(moduleId),
    enabled: !!moduleId,
  })
}

export function useCreateTrainingModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<TrainingModule, "id" | "createdAt" | "updatedAt">) => createTrainingModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-modules"] })
    },
  })
}

export function useUpdateTrainingModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Partial<TrainingModule> }) =>
      updateTrainingModule(moduleId, data),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training-modules"] })
      queryClient.invalidateQueries({ queryKey: ["training-module", variables.moduleId] })
    },
  })
}

export function useDeleteTrainingModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTrainingModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-modules"] })
    },
  })
}

export function useTrainingProgress(userId?: string) {
  return useQuery({
    queryKey: ["training-progress", userId],
    queryFn: () => getTrainingProgress(userId as string),
    enabled: !!userId,
  })
}

export function useAllTrainingProgress() {
  return useQuery({
    queryKey: ["training-progress-all"],
    queryFn: getAllTrainingProgress,
  })
}

export function useUpsertTrainingProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<TrainingProgress> }) =>
      upsertTrainingProgress(userId, data),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training-progress", variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["training-progress-all"] })
    },
  })
}
