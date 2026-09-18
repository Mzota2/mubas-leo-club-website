"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTrainings } from "@/lib/firebase/firestore"
import type { Training } from "@/lib/types"

export function useTrainings() {
  return useQuery({
    queryKey: ["trainings"],
    queryFn: () => getTrainings(),
  })
}
