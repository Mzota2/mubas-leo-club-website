"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, CheckCircle, XCircle } from "lucide-react"

export default function OrdersPage() {
  // Mock order data
  const orders = [
    {
      id: "ORD-2025-001",
      date: "2025-01-15",
      items: [
        { name: "Black T-shirt", quantity: 2, price: 15000 },
        { name: "Leo Club Cap", quantity: 1, price: 8000 },
      ],
      total: 38000,
      status: "delivered",
    },
    {
      id: "ORD-2025-002",
      date: "2025-01-20",
      items: [{ name: "Black Golf Shirt", quantity: 1, price: 25000 }],
      total: 27000,
      status: "processing",
    },
    {
      id: "ORD-2025-003",
      date: "2025-01-22",
      items: [{ name: "Yellow T-shirt", quantity: 3, price: 15000 }],
      total: 47000,
      status: "pending",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      delivered: "bg-green-500",
      processing: "bg-blue-500",
      pending: "bg-amber-500",
      cancelled: "bg-red-500",
    }
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white border-none`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled")
  const completedOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled")

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
        <p className="text-sm opacity-90">{orders.length} total orders</p>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-[#F59E0B]">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-[#F59E0B]">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <Card key={order.id} className="bg-white/90 backdrop-blur-sm border-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold mb-1">{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">MWK {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-leo-primary">MWK {order.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <Package className="h-16 w-16 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No active orders</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <Card key={order.id} className="bg-white/90 backdrop-blur-sm border-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-bold mb-1">{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">MWK {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-leo-primary">MWK {order.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <CheckCircle className="h-16 w-16 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No completed orders yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
