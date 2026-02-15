"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", activities: 4 },
  { month: "Feb", activities: 3 },
  { month: "Mar", activities: 5 },
  { month: "Apr", activities: 7 },
  { month: "May", activities: 6 },
  { month: "Jun", activities: 8 },
  { month: "Jul", activities: 5 },
]

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Participation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="activities" stroke="#F5A623" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
