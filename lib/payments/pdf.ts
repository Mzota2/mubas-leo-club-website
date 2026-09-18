function pdfEscape(text: string) {
  return text
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
}

function wrapLine(text: string, max = 86) {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > max) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

export function buildSimplePdf(title: string, lines: string[]) {
  const contentLines = [`BT /F1 18 Tf 50 790 Td (${pdfEscape(title)}) Tj`]
  let firstBody = true
  for (const line of lines.flatMap((item) => wrapLine(item))) {
    if (firstBody) {
      contentLines.push(`/F1 11 Tf 0 -28 Td (${pdfEscape(line)}) Tj`)
      firstBody = false
    } else {
      contentLines.push(`0 -16 Td (${pdfEscape(line)}) Tj`)
    }
  }
  contentLines.push("ET")
  const stream = contentLines.join("\n")

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ]

  let offset = 9
  const offsets = [0]
  let body = "%PDF-1.4\n"
  for (const object of objects) {
    offsets.push(offset)
    body += `${object}\n`
    offset = body.length
  }

  const xrefStart = body.length
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const value of offsets.slice(1)) {
    xref += `${String(value).padStart(10, "0")} 00000 n \n`
  }

  return `${body}${xref}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
}

export function downloadPdf(filename: string, title: string, lines: string[]) {
  const pdf = buildSimplePdf(title, lines)
  const blob = new Blob([pdf], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
