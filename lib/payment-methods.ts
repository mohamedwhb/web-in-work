export type PaymentMethodType =
  | "bank_transfer"
  | "cash"
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "direct_debit"
  | "invoice"
  | "check"
  | "custom"

export interface PaymentMethodFee {
  type: "fixed" | "percentage"
  value: number
}

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  name: string
  description: string
  enabled: boolean
  isDefault: boolean
  processingTime: string
  fee: PaymentMethodFee | null
  customFields: Record<string, string>
  order: number
  icon: string
}

// Mock data for payment methods
export const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "bank-transfer",
    type: "bank_transfer",
    name: "Banküberweisung",
    description: "Zahlung per Banküberweisung",
    enabled: true,
    isDefault: true,
    processingTime: "2-3 Werktage",
    fee: null,
    customFields: {
      bankName: "Ihre Bank",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "COBADEFFXXX",
      accountHolder: "Ihr Unternehmen GmbH",
    },
    order: 1,
    icon: "bank",
  },
  {
    id: "cash",
    type: "cash",
    name: "Barzahlung",
    description: "Zahlung in bar bei Lieferung oder Abholung",
    enabled: true,
    isDefault: false,
    processingTime: "Sofort",
    fee: null,
    customFields: {},
    order: 2,
    icon: "banknote",
  },
  {
    id: "credit-card",
    type: "credit_card",
    name: "Kreditkarte",
    description: "Zahlung mit Visa, Mastercard oder American Express",
    enabled: true,
    isDefault: false,
    processingTime: "Sofort",
    fee: {
      type: "percentage",
      value: 1.9,
    },
    customFields: {
      acceptedCards: "Visa, Mastercard, American Express",
    },
    order: 3,
    icon: "credit-card",
  },
  {
    id: "debit-card",
    type: "debit_card",
    name: "EC-Karte",
    description: "Zahlung mit EC-Karte / Girocard",
    enabled: true,
    isDefault: false,
    processingTime: "Sofort",
    fee: {
      type: "fixed",
      value: 0.25,
    },
    customFields: {},
    order: 4,
    icon: "credit-card",
  },
  {
    id: "paypal",
    type: "paypal",
    name: "PayPal",
    description: "Schnelle und sichere Zahlung mit PayPal",
    enabled: false,
    isDefault: false,
    processingTime: "Sofort",
    fee: {
      type: "percentage",
      value: 2.49,
    },
    customFields: {
      paypalEmail: "ihr-unternehmen@example.com",
    },
    order: 5,
    icon: "paypal",
  },
  {
    id: "direct-debit",
    type: "direct_debit",
    name: "Lastschrift",
    description: "Zahlung per SEPA-Lastschrift",
    enabled: false,
    isDefault: false,
    processingTime: "2-3 Werktage",
    fee: null,
    customFields: {
      creditorId: "DE98ZZZ09999999999",
      mandateInfo: "SEPA-Lastschriftmandat erforderlich",
    },
    order: 6,
    icon: "landmark",
  },
  {
    id: "invoice",
    type: "invoice",
    name: "Rechnung",
    description: "Zahlung nach Erhalt der Rechnung",
    enabled: true,
    isDefault: false,
    processingTime: "14 Tage",
    fee: null,
    customFields: {
      paymentTerms: "14 Tage netto",
    },
    order: 7,
    icon: "file-text",
  },
]

// Service functions for payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  // In a real app, this would fetch from an API or database
  return Promise.resolve([...defaultPaymentMethods])
}

export const updatePaymentMethod = async (updatedMethod: PaymentMethod): Promise<PaymentMethod> => {
  // In a real app, this would update the database
  return Promise.resolve(updatedMethod)
}

export const createPaymentMethod = async (newMethod: Omit<PaymentMethod, "id">): Promise<PaymentMethod> => {
  // In a real app, this would create in the database
  const id = `custom-${Date.now()}`
  return Promise.resolve({ ...newMethod, id })
}

export const deletePaymentMethod = async (id: string): Promise<void> => {
  // In a real app, this would delete from the database
  return Promise.resolve()
}

export const reorderPaymentMethods = async (methods: PaymentMethod[]): Promise<PaymentMethod[]> => {
  // In a real app, this would update the database
  return Promise.resolve(methods)
}
