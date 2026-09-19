import { assemblePdf, imageObject, jpegDimensions, pdfEscape, wrapLine } from "@/lib/payments/pdf"
import type { PaymentReceipt, ReceiptLineItem } from "@/lib/payments/types"
import { formatDate, formatMoney } from "@/lib/utils/format"

const CLUB = {
  name: "MUBAS Leo Club",
  email: "mubasleoclub@gmail.com",
  phone: "+265 999 123 456",
  address: "MUBAS Campus, Blantyre, Malawi",
  web: "instagram.com/mubasleoclub",
}

function text(x: number, y: number, value: string, size = 10, font = "F1") {
  return `BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfEscape(value)}) Tj ET`
}

function line(x1: number, y1: number, x2: number, y2: number) {
  return `${x1} ${y1} m ${x2} ${y2} l S`
}

function fillRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
  return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f 0 0 0 rg`
}

function strokeRect(x: number, y: number, w: number, h: number) {
  return `${x} ${y} ${w} ${h} re S`
}

function statusLabel(status: string) {
  const value = status.toLowerCase()
  if (value === "paid" || value === "completed") return "PAID"
  if (value === "pending") return "PENDING"
  if (value === "overdue") return "OVERDUE"
  if (value === "failed") return "FAILED"
  return status.toUpperCase()
}

export function receiptLineItems(receipt: PaymentReceipt): ReceiptLineItem[] {
  if (receipt.items && receipt.items.length > 0) return receipt.items
  return [
    {
      name: receipt.kind === "donation" ? "Donation" : receipt.kind === "joining" ? "Joining fee" : receipt.kind === "order" ? "Shop order" : "Membership fee",
      description: receipt.detail || receipt.title,
      quantity: 1,
      total: receipt.amount,
    },
  ]
}

export function buildReceiptPdf(receipt: PaymentReceipt, logo?: Uint8Array | null) {
  const left = 48
  const right = 547
  const width = right - left
  const items = receiptLineItems(receipt).slice(0, 10)
  const money = (value: number) => formatMoney(value, receipt.currency)
  const ops: string[] = ["0.15 0.15 0.15 RG", "0.15 0.15 0.15 rg", "1 w"]

  const logoSize = 52
  const logoY = 742
  const hasLogo = Boolean(logo && jpegDimensions(logo))
  if (hasLogo) {
    ops.push(`q ${logoSize} 0 0 ${logoSize} ${left} ${logoY} cm /Im1 Do Q`)
  } else {
    ops.push(strokeRect(left, logoY, logoSize, logoSize))
    ops.push(text(left + 12, logoY + 22, "LEO", 12, "F2"))
  }

  ops.push(text(left + 64, 780, CLUB.name.toUpperCase(), 12, "F2"))
  ops.push(text(left + 64, 764, CLUB.email, 8))
  ops.push(text(left + 64, 752, CLUB.phone, 8))
  ops.push(text(left + 64, 740, CLUB.address, 8))
  ops.push(text(left + 64, 728, CLUB.web, 8))
  ops.push(text(430, 776, "RECEIPT", 22, "F2"))
  ops.push(line(left, 716, right, 716))

  ops.push(text(left, 696, "RECEIVED FROM", 8, "F2"))
  ops.push(text(left, 680, receipt.payerName || "Donor", 11, "F2"))
  if (receipt.payerEmail) ops.push(text(left, 666, receipt.payerEmail, 9))
  ops.push(line(318, 704, 318, 644))

  const metaX = 340
  const rows = [
    ["RECEIPT #:", receipt.txRef],
    ["DATE:", formatDate(receipt.date)],
    ["PAYMENT METHOD:", receipt.method],
    ["REFERENCE #:", receipt.txRef],
  ]
  rows.forEach(([label, value], index) => {
    const y = 696 - index * 16
    ops.push(text(metaX, y, label, 8, "F2"))
    ops.push(text(metaX + 92, y, value, 8))
  })

  const tableTop = 590
  const rowH = 22
  const cols = [left, left + 128, left + 338, left + 392, right]
  ops.push(fillRect(left, tableTop, width, rowH, 0.94, 0.94, 0.94))
  ops.push(strokeRect(left, tableTop, width, rowH))
  ;["ITEM / SERVICE", "DESCRIPTION", "QTY", "TOTAL"].forEach((label, index) => {
    ops.push(text(cols[index] + 6, tableTop + 7, label, 8, "F2"))
  })

  items.forEach((item, index) => {
    const y = tableTop - (index + 1) * rowH
    ops.push(strokeRect(left, y, width, rowH))
    cols.slice(1, -1).forEach((x) => ops.push(line(x, y, x, y + rowH)))
    ops.push(text(cols[0] + 6, y + 7, wrapLine(item.name, 22)[0] || item.name, 8))
    ops.push(text(cols[1] + 6, y + 7, wrapLine(item.description, 34)[0] || item.description, 8))
    ops.push(text(cols[2] + 16, y + 7, String(item.quantity), 8))
    ops.push(text(cols[3] + 6, y + 7, money(item.total), 8))
  })

  const tableBottom = tableTop - items.length * rowH
  const notesY = tableBottom - 36
  ops.push(text(left, notesY, "NOTES:", 8, "F2"))
  const note = receipt.detail
    ? `Thank you for your payment. ${receipt.detail}`
    : "Thank you for your payment! We appreciate your support of MUBAS Leo Club."
  wrapLine(note, 48)
    .slice(0, 3)
    .forEach((lineText, index) => ops.push(text(left, notesY - 14 - index * 12, lineText, 8)))

  const totalsX = 360
  let totalsY = tableBottom - 28
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const totals = [
    ["SUBTOTAL", money(subtotal)],
    ["TAX (0%)", money(0)],
    ["TOTAL", money(receipt.amount)],
  ]
  totals.forEach(([label, value], index) => {
    const y = totalsY - index * 18
    const bold = index === 2
    if (bold) ops.push(fillRect(totalsX, y - 4, right - totalsX, 18, 0.96, 0.96, 0.96))
    ops.push(text(totalsX + 8, y, label, 8, bold ? "F2" : "F1"))
    ops.push(text(totalsX + 92, y, value, 8, bold ? "F2" : "F1"))
  })

  const statusY = totalsY - 70
  ops.push(text(totalsX + 8, statusY, "STATUS:", 8, "F2"))
  ops.push(fillRect(totalsX + 68, statusY - 5, 70, 16, 0.28, 0.28, 0.28))
  ops.push("1 1 1 rg")
  ops.push(text(totalsX + 80, statusY, statusLabel(receipt.status), 8, "F2"))
  ops.push("0.15 0.15 0.15 rg")

  ops.push(line(left, 88, right, 88))
  ops.push(text(220, 64, "Thank You", 16, "F3"))
  ops.push(text(188, 46, "WE APPRECIATE YOUR SUPPORT", 8))

  const stream = ops.join("\n")
  const fonts = `
/Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >>
`.trim()
  const imageResource = hasLogo ? " /XObject << /Im1 8 0 R >>" : ""
  const objects: Array<string | Uint8Array> = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << ${fonts}${imageResource} >> >> endobj`,
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    "7 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> endobj",
  ]
  if (hasLogo && logo) {
    const size = jpegDimensions(logo)
    if (size) objects.push(imageObject(8, logo, size.width, size.height))
  }
  return assemblePdf(objects)
}

export async function loadReceiptLogo() {
  try {
    const response = await fetch("/logo.jpeg")
    if (!response.ok) return null
    const bytes = new Uint8Array(await response.arrayBuffer())
    return jpegDimensions(bytes) ? bytes : null
  } catch {
    return null
  }
}
