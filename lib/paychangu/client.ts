export interface PayChanguPaymentData {
  amount: number
  email: string
  firstName: string
  lastName: string
  currency?: string
  callbackUrl?: string
  returnUrl?: string
  purpose?: "donation" | "order" | "membership"
  userId?: string
  message?: string
  causeId?: string
  causeTitle?: string
  fiscalYear?: string
  txRef?: string
  period?: "monthly" | "semester" | "yearly"
  coverageStart?: string
  coverageEnd?: string
  dueDate?: string
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
  try {
    const response = await fetch(`/api/payments/verify?transactionId=${transactionId}`)
    const result = await response.json()
    return result.success
  } catch (error) {
    return false
  }
}
