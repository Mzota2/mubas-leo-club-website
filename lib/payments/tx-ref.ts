export function readTxRef(searchParams: { get: (key: string) => string | null }) {
  return searchParams.get("txRef") || searchParams.get("tx_ref") || searchParams.get("transactionId")
}
