"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PortalPageHeader } from "@/components/portal/page-header"
import { ReceiptButton } from "@/components/payments/receipt-button"
import { portalTabsListClass, portalTabsTriggerClass } from "@/components/portal/styles"
import { useAuth } from "@/lib/hooks/use-auth"
import { useOrders } from "@/lib/hooks/use-orders"
import { SAMPLE_ORDERS } from "@/lib/payments/defaults"
import { orderToRecord } from "@/lib/payments/receipt"
import { formatDate, formatMoney } from "@/lib/utils/format"
import type { Order } from "@/lib/types"

function getStatusIcon(status: Order["status"]) {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-green-500" />
  if (status === "processing") return <Package className="h-5 w-5 text-blue-500" />
  if (status === "cancelled") return <XCircle className="h-5 w-5 text-red-500" />
  return <Clock className="h-5 w-5 text-amber-500" />
}

function statusClass(status: Order["status"] | Order["paymentStatus"]) {
  if (status === "completed" || status === "paid") return "border-transparent bg-emerald-500 text-white"
  if (status === "processing") return "border-transparent bg-sky-500 text-white"
  if (status === "cancelled" || status === "failed") return "border-transparent bg-rose-500 text-white"
  return "border-transparent bg-amber-500 text-white"
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <h3 className="font-semibold">{order.txRef || order.id}</h3>
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge className={statusClass(order.paymentStatus)}>{order.paymentStatus}</Badge>
            <Badge className={statusClass(order.status)}>{order.status}</Badge>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {(order.items ?? []).map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">{formatMoney(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-leo-primary">{formatMoney(order.total)}</span>
        </div>
        <div className="mt-4 flex justify-end">
          <ReceiptButton record={orderToRecord(order)} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { data: liveOrders = [], isLoading } = useOrders(user?.id, true)
  const usingSamples = !isLoading && liveOrders.length === 0
  const orders = usingSamples ? SAMPLE_ORDERS : liveOrders
  const activeOrders = orders.filter((order) => order.status === "pending" || order.status === "processing")
  const completedOrders = orders.filter((order) => order.status === "completed" || order.status === "cancelled")

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <PortalPageHeader
        title="My orders"
        description="Shop orders paid through PayChangu. Download a receipt for any completed payment."
        actions={
          <Button asChild className="bg-white text-neutral-900 lg:bg-leo-primary lg:text-white">
            <Link href="/portal/shop">Shop</Link>
          </Button>
        }
      />

      {usingSamples ? (
        <Alert className="border-none bg-white/90">
          <AlertDescription>
            No live shop orders yet. These examples show how PayChangu orders will appear after checkout.
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className={portalTabsListClass}>
          <TabsTrigger value="active" className={portalTabsTriggerClass}>
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className={portalTabsTriggerClass}>
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="border-none bg-white p-12 text-center shadow-sm">
              <Package className="mx-auto mb-3 h-16 w-16 text-gray-400" />
              <p className="text-gray-600">No active orders</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="border-none bg-white p-12 text-center shadow-sm">
              <CheckCircle className="mx-auto mb-3 h-16 w-16 text-gray-400" />
              <p className="text-gray-600">No completed orders yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
