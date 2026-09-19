import { periodLabel } from "@/lib/membership/billing"
import { displayName, formatDate } from "@/lib/utils/format"
import { downloadBytes } from "@/lib/payments/pdf"
import { buildReceiptPdf, loadReceiptLogo } from "@/lib/payments/receipt-pdf"
import type { PaymentKind, PaymentRecord, PaymentReceipt, PaymentStatus } from "@/lib/payments/types"
import type { Donation, MembershipFee, Order, User } from "@/lib/types"

export function kindLabel(kind: PaymentKind) {
  if (kind === "donation") return "Donation"
  if (kind === "joining") return "Joining fee"
  if (kind === "order") return "Shop order"
  return "Membership fee"
}

export function recordToReceipt(record: PaymentRecord): PaymentReceipt {
  return {
    kind: record.kind,
    title: record.title,
    payerName: record.payerName,
    payerEmail: record.payerEmail,
    amount: record.amount,
    currency: record.currency,
    txRef: record.txRef || record.id,
    date: record.date,
    method: record.method === "offline" ? "Recorded offline" : record.method === "paychangu" ? "PayChangu" : "—",
    detail: record.detail,
    status: record.status,
    items:
      record.items && record.items.length > 0
        ? record.items
        : [
            {
              name: kindLabel(record.kind),
              description: record.title,
              quantity: 1,
              total: record.amount,
            },
          ],
  }
}

export async function downloadReceipt(receipt: PaymentReceipt) {
  const filename = `mubas-leo-receipt-${receipt.txRef}.pdf`
  const logo = await loadReceiptLogo()
  downloadBytes(filename, buildReceiptPdf(receipt, logo))
}

export function paymentTotals(records: PaymentRecord[]) {
  const paid = (kind?: PaymentKind) =>
    records
      .filter((record) => record.status === "paid" && (!kind || record.kind === kind))
      .reduce((sum, record) => sum + record.amount, 0)
  return {
    donations: paid("donation"),
    membership: paid("membership"),
    joining: paid("joining"),
    shop: paid("order"),
    total: paid(),
    pending: records.filter((record) => record.status === "pending").length,
  }
}

export function donationToRecord(donation: Donation): PaymentRecord {
  return {
    id: donation.id,
    kind: "donation",
    title: donation.causeTitle || "General donation",
    payerName: donation.donorName || "Anonymous",
    payerEmail: donation.donorEmail,
    amount: Number(donation.amount) || 0,
    currency: donation.currency || "MWK",
    status: donation.paymentStatus === "completed" ? "paid" : donation.paymentStatus,
    method: "paychangu",
    txRef: donation.txRef,
    date: donation.createdAt,
    detail: donation.message || donation.causeTitle,
  }
}

export function feeToRecord(fee: MembershipFee, member?: User | null): PaymentRecord {
  const kind: PaymentKind = fee.period === "joining" ? "joining" : "membership"
  const status: PaymentStatus = fee.status === "paid" ? "paid" : fee.status === "overdue" ? "overdue" : "pending"
  return {
    id: fee.id,
    kind,
    title: periodLabel(fee.period),
    payerName: member ? displayName(member) : fee.userId,
    payerEmail: member?.email,
    amount: Number(fee.amount) || 0,
    currency: "MWK",
    status,
    method: fee.method || "unknown",
    txRef: fee.txRef,
    date: fee.paymentDate || fee.createdAt,
    detail: fee.notes || (fee.coverageStart ? `Coverage ${formatDate(fee.coverageStart)} – ${formatDate(fee.coverageEnd)}` : undefined),
  }
}

export function orderToRecord(order: Order): PaymentRecord {
  const lines = (order.items ?? []).map((item) => ({
    name: item.name,
    description: [item.size, item.color].filter(Boolean).join(" · ") || item.name,
    quantity: item.quantity,
    total: Number(item.price) * Number(item.quantity),
  }))
  if (order.deliveryFee) {
    lines.push({
      name: "Delivery",
      description: order.shippingAddress || "Delivery fee",
      quantity: 1,
      total: Number(order.deliveryFee),
    })
  }
  const itemSummary = (order.items ?? []).map((item) => `${item.name} × ${item.quantity}`).join(", ")
  return {
    id: order.id,
    kind: "order",
    title: itemSummary || "Shop order",
    payerName: order.customerName || order.userId,
    payerEmail: order.customerEmail,
    amount: Number(order.total) || 0,
    currency: order.currency || "MWK",
    status: order.paymentStatus === "paid" ? "paid" : order.paymentStatus,
    method: order.paymentMethod === "paychangu" ? "paychangu" : order.paymentMethod === "offline" ? "offline" : "unknown",
    txRef: order.txRef,
    date: order.updatedAt || order.createdAt,
    detail: order.shippingAddress,
    items: lines,
  }
}

export function withLiveOrSample(live: PaymentRecord[], samples: PaymentRecord[]) {
  return live.length > 0 ? live : samples
}
