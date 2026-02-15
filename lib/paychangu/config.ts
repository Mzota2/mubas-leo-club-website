export const PAYCHANGU_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY || "",
  baseUrl: "https://api.paychangu.com/v1",
  currency: "MWK",
}

export interface PayChanguPaymentRequest {
  amount: number
  email: string
  first_name: string
  last_name: string
  callback_url: string
  return_url: string
  tx_ref: string
  customization?: {
    title?: string
    description?: string
  }
}

export interface PayChanguPaymentResponse {
  status: "success" | "error"
  message: string
  data?: {
    payment_url: string
    tx_ref: string
  }
}
