export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set<string>()),
  )

  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value)
    return `"${text.replace(/"/g, '""')}"`
  }

  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join(
    "\n",
  )
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
