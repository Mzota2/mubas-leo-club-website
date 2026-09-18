"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function ShopSearch({
  value,
  onChange,
  placeholder = "What do you want to buy ?",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-md border-none bg-white pl-10 text-neutral-900 shadow-sm placeholder:text-neutral-500"
      />
    </div>
  )
}
