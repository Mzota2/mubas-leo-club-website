export interface PayChanguPaymentData {
  amount: number
  email: string
  firstName: string
  lastName: string
  currency?: string
  callbackUrl?: string
  returnUrl?: string
  purpose?: "donation" | "order" | "membership" | "joining"
  userId?: string
  message?: string
  causeId?: string
  causeTitle?: string
  fiscalYear?: string
  txRef?: string
  period?: "monthly" | "semester" | "yearly" | "joining"
  coverageStart?: string
  coverageEnd?: string
  dueDate?: string
  items?: Array<{
    productId: string
    name: string
    quantity: number
    price: number
    size?: string
    color?: string
  }>
  shippingAddress?: string
  phone?: string
  customerName?: string
  deliveryFee?: number
  subtotal?: number
  customization?: {
    title?: string
    description?: string
  }
}

export interface PayChanguResponse {
  success: boolean
  checkoutUrl?: string
  transactionId?: string
  error?: string
}

export async function initiatePayment(data: PayChanguPaymentData): Promise<PayChanguResponse> {
  try {
    const response = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error) {
    return {
      success: false,
      error: "Failed to initiate payment",
    }
  }
}

export async function verifyPayment(transactionId: string): Promise<boolean> {
  const result = await verifyPaymentDetails(transactionId)
  return result.success
}

export async function verifyPaymentDetails(transactionId: string) {
  try {
    const response = await fetch(`/api/payments/verify?transactionId=${encodeURIComponent(transactionId)}`)
    return await response.json()
  } catch {
    return { success: false, error: "Failed to verify payment" }
  }
}
