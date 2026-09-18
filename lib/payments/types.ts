export type PaymentKind = "donation" | "membership" | "joining" | "order"

export type PaymentStatus = "paid" | "pending" | "failed" | "overdue"

export type PaymentRecord = {
  id: string
  kind: PaymentKind
  title: string
  payerName: string
  payerEmail?: string
  amount: number
  currency: string
  status: PaymentStatus
  method: "paychangu" | "offline" | "unknown"
  txRef?: string
  date: string
  detail?: string
  sample?: boolean
}

export type PaymentReceipt = {
  kind: PaymentKind
  title: string
  payerName: string
  payerEmail?: string
  amount: number
  currency: string
  txRef: string
  date: string
  method: string
  detail?: string
  status: string
}
