export type ParsedTransaction = {
  date: Date
  description: string
  amount: number
  balance: number | null
  confidence: number
}

function parseDateDDMonYYYY(s: string): Date | null {
  const m: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }
  const re = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
  const match = s.match(re)
  if (!match) return null
  return new Date(Number(match[3]), m[match[2].toLowerCase()], Number(match[1]))
}

function parseDateMMDDYYYY(s: string): Date | null {
  const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = s.match(re)
  if (!match) return null
  return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]))
}

function parseDateYYYYMMDD(s: string): Date | null {
  const re = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  const match = s.match(re)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function parseDate(s: string): Date | null {
  return parseDateDDMonYYYY(s) || parseDateMMDDYYYY(s) || parseDateYYYYMMDD(s)
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/[₹,]/g, "").trim()
  return parseFloat(cleaned)
}

function trySample1(text: string): ParsedTransaction | null {
  const dateRe = /^Date:\s*(.+)$/im
  const descRe = /^Description:\s*(.+)$/im
  const amtRe = /^Amount:\s*(-?[₹,]?[\d,]+\.?\d*)/im
  const balRe = /^Balance after transaction:\s*(-?[₹,]?[\d,]+\.?\d*)/im

  const dateMatch = text.match(dateRe)
  const descMatch = text.match(descRe)
  const amtMatch = text.match(amtRe)
  const balMatch = text.match(balRe)

  if (!dateMatch || !descMatch || !amtMatch) return null

  const date = parseDate(dateMatch[1].trim())
  if (!date) return null

  const amount = parseAmount(amtMatch[1])
  const balance = balMatch ? parseAmount(balMatch[1]) : null

  let confidence = 100
  if (!balMatch) confidence -= 20

  return { date, description: descMatch[1].trim(), amount, balance, confidence }
}

function trySample2(text: string): ParsedTransaction | null {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const descMatch = lines[0].match(/^(.+?)\s*$/)

  const line1Re = /^(\d{1,2}\/\d{1,2}\/\d{4})\s*[→\-]\s*[₹]?([\d,]+\.?\d*)\s+debited/i
  const line1Match = lines[1].match(line1Re)

  const balRe = /^Available Balance\s*[→\-]\s*[₹]?([\d,]+\.?\d*)/im
  const balMatch = text.match(balRe)

  if (!descMatch || !line1Match) return null

  const date = parseDate(line1Match[1])
  if (!date) return null

  const amount = -Math.abs(parseAmount(line1Match[2]))
  const balance = balMatch ? parseAmount(balMatch[1]) : null

  let confidence = 100
  if (!balMatch) confidence -= 20

  return { date, description: lines[0], amount, balance, confidence }
}

function trySample3(text: string): ParsedTransaction | null {
  const re = /^txn\S+\s+(\d{4}-\d{2}-\d{2})\s+(.+?)\s+[₹]?([\d,]+\.?\d*)\s+Dr\s+Bal\s+([\d,]+\.?\d*)\s+(.+)$/i
  const match = text.match(re)
  if (!match) return null

  const date = parseDate(match[1])
  if (!date) return null

  const amount = -Math.abs(parseAmount(match[3]))
  const balance = parseAmount(match[4])

  return { date, description: match[2].trim(), amount, balance, confidence: 100 }
}

export function parseTransaction(text: string): ParsedTransaction {
  return trySample1(text) || trySample2(text) || trySample3(text) || {
    date: new Date(),
    description: text.slice(0, 100),
    amount: 0,
    balance: null,
    confidence: 0,
  }
}
