"use client"

import { useQuery } from "@tanstack/react-query"
import { getBirthdayCalendar } from "@/lib/firebase/firestore"

export function useBirthdayCalendar() {
  return useQuery({
    queryKey: ["birthday-calendar"],
    queryFn: getBirthdayCalendar,
  })
}
