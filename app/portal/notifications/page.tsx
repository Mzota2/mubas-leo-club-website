"use client"

import { useNotifications, useMarkNotificationRead } from "@/lib/hooks/use-notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Cake, Calendar, Megaphone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { PortalPageHeader } from "@/components/portal/page-header"
import { portalTabsListClass, portalTabsTriggerClass } from "@/components/portal/styles"

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationRead()

  const unreadNotifications = notifications?.filter((n) => !n.read)
  const readNotifications = notifications?.filter((n) => n.read)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Cake className="h-5 w-5 text-pink-500" />
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "announcement":
        return <Megaphone className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <PortalPageHeader
        title="Notifications"
        description={
          unreadNotifications && unreadNotifications.length > 0
            ? `${unreadNotifications.length} unread`
            : "Stay up to date with club activity"
        }
      />

      {/* Notifications Tabs */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className={portalTabsListClass}>
          <TabsTrigger value="unread" className={portalTabsTriggerClass}>
            Unread {unreadNotifications && `(${unreadNotifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="all" className={portalTabsTriggerClass}>
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-3 mt-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/90">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : unreadNotifications && unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <Card
                key={notification.id}
                className="bg-white/90 border-l-4 border-l-[#F59E0B] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => markAsRead.mutate(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <Badge className="bg-[#F59E0B] text-white border-none text-xs">New</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No unread notifications</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-3 mt-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-white/90">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-white/90 hover:shadow-lg transition-shadow ${!notification.read ? "border-l-4 border-l-[#F59E0B]" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-sm ${notification.read ? "text-gray-700" : "font-semibold"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge className="bg-[#F59E0B] text-white border-none text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No notifications yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
