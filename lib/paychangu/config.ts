export const PAYCHANGU_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY || process.env.PAYCHANGU_PUBLIC_KEY || "",
  secretKey: process.env.PAYCHANGU_SECRET_KEY || "",
  paymentUrl: process.env.PAYCHANGU_BASE_URL
    ? `${process.env.PAYCHANGU_BASE_URL.replace(/\/$/, "")}/payment`
    : "https://api.paychangu.com/payment",
  verifyUrl: process.env.PAYCHANGU_BASE_URL
    ? `${process.env.PAYCHANGU_BASE_URL.replace(/\/$/, "")}/verify-payment`
    : "https://api.paychangu.com/verify-payment",
  currency: "MWK",
}
