"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadReceipt, recordToReceipt } from "@/lib/payments/receipt"
import type { PaymentReceipt, PaymentRecord } from "@/lib/payments/types"

export function ReceiptButton({
  record,
  receipt,
  disabled,
}: {
  record?: PaymentRecord
  receipt?: PaymentReceipt | null
  disabled?: boolean
}) {
  const payload = receipt || (record ? recordToReceipt(record) : null)
  const canDownload = Boolean(payload) && (payload?.status === "paid" || payload?.status === "completed") && !disabled

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!canDownload}
      onClick={() => payload && downloadReceipt(payload)}
    >
      <Download className="h-4 w-4" />
      Receipt
    </Button>
  )
}
