"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReceiptButton } from "@/components/payments/receipt-button"
import { formatDate, formatMoney } from "@/lib/utils/format"
import { kindLabel } from "@/lib/payments/receipt"
import type { PaymentRecord } from "@/lib/payments/types"

const statusClass: Record<PaymentRecord["status"], string> = {
  paid: "border-transparent bg-emerald-500 text-white",
  pending: "border-transparent bg-amber-500 text-white",
  failed: "border-transparent bg-rose-500 text-white",
  overdue: "border-transparent bg-rose-500 text-white",
}

export function PaymentsTable({ records }: { records: PaymentRecord[] }) {
  if (records.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No payments found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                <div>
                  {record.txRef || record.id.slice(0, 8)}
                  {record.sample ? <p className="text-xs text-amber-700">Sample</p> : null}
                </div>
              </TableCell>
              <TableCell>{kindLabel(record.kind)}</TableCell>
              <TableCell>
                <p>{record.payerName}</p>
                {record.payerEmail ? <p className="text-xs text-muted-foreground">{record.payerEmail}</p> : null}
              </TableCell>
              <TableCell className="max-w-[16rem]">
                <p className="truncate">{record.title}</p>
                {record.detail ? <p className="truncate text-xs text-muted-foreground">{record.detail}</p> : null}
              </TableCell>
              <TableCell>{formatMoney(record.amount, record.currency)}</TableCell>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell>
                <Badge className={statusClass[record.status]}>{record.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <ReceiptButton record={record} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
