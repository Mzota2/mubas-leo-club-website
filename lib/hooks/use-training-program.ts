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
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["training-progress", userId] })
      const previous = queryClient.getQueryData<TrainingProgress | null>(["training-progress", userId])
      queryClient.setQueryData<TrainingProgress>(["training-progress", userId], {
        ...(previous ?? {
          id: userId,
          userId,
          xp: 0,
          badges: [],
          completedModuleIds: [],
          viewedResourceIds: [],
          quizAttempts: [],
          status: "not_started",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        ...data,
        id: userId,
        userId,
      })
      return { previous }
    },
    onError: (_error, variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["training-progress", variables.userId], context.previous)
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training-progress", variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["training-progress-all"] })
    },
  })
}
