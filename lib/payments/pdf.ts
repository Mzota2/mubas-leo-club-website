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

function encode(text: string) {
  return new TextEncoder().encode(text)
}

export function assemblePdf(objects: Array<string | Uint8Array>) {
  const parts: Uint8Array[] = [encode("%PDF-1.4\n")]
  const offsets = [0]
  let offset = parts[0].length

  for (const object of objects) {
    offsets.push(offset)
    const bytes = typeof object === "string" ? encode(`${object}\n`) : object
    parts.push(bytes)
    offset += bytes.length
  }

  const xrefStart = offset
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const value of offsets.slice(1)) {
    xref += `${String(value).padStart(10, "0")} 00000 n \n`
  }
  const trailer = `${xref}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  parts.push(encode(trailer))

  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let cursor = 0
  for (const part of parts) {
    output.set(part, cursor)
    cursor += part.length
  }
  return output
}

export function jpegDimensions(bytes: Uint8Array) {
  let index = 2
  while (index < bytes.length - 8) {
    if (bytes[index] !== 0xff) return null
    const marker = bytes[index + 1]
    const length = (bytes[index + 2] << 8) + bytes[index + 3]
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: (bytes[index + 5] << 8) + bytes[index + 6],
        width: (bytes[index + 7] << 8) + bytes[index + 8],
      }
    }
    index += 2 + length
  }
  return null
}

export function imageObject(id: number, bytes: Uint8Array, width: number, height: number) {
  const header = encode(
    `${id} 0 obj << /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >> stream\n`,
  )
  const footer = encode("\nendstream endobj\n")
  const output = new Uint8Array(header.length + bytes.length + footer.length)
  output.set(header, 0)
  output.set(bytes, header.length)
  output.set(footer, header.length + bytes.length)
  return output
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

  return assemblePdf([
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ])
}

export function downloadBytes(filename: string, bytes: Uint8Array, type = "application/pdf") {
  const blob = new Blob([bytes], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadPdf(filename: string, title: string, lines: string[]) {
  downloadBytes(filename, buildSimplePdf(title, lines))
}

export { pdfEscape, wrapLine }
