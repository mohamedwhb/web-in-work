export type PaymentStatus = "unpaid" | "partial" | "paid" | "overdue" | "cancelled"
export type PaymentMethod = "bank_transfer" | "cash" | "credit_card" | "paypal" | "direct_debit"

export interface InvoiceItem {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  unit: string
}

export interface Customer {
  id: string
  name: string
  address: string
  email: string
  phone: string
  taxId: string
}

export interface InvoiceData {
  id: string
  date: Date
  customer: Customer
  items: InvoiceItem[]
  notes: string
  paymentTerms: string
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paymentDueDate: Date
  paymentDate: Date | null
  paymentAmount: number
  paymentReference: string
  offerReference: string
}
