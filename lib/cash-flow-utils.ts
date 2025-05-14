import { addDays, format } from "date-fns"
import { de } from "date-fns/locale"
import type { InvoiceData, PaymentStatus } from "./invoice-types"

// Define types for cash flow data
export interface CashFlowDataPoint {
  date: Date
  expected: number
  optimistic: number
  pessimistic: number
  cumulative: number
  cumulativeOptimistic: number
  cumulativePessimistic: number
}

export interface CashFlowPrediction {
  dailyData: CashFlowDataPoint[]
  weeklyData: CashFlowDataPoint[]
  monthlyData: CashFlowDataPoint[]
  summary: {
    totalExpected: number
    next30Days: number
    next60Days: number
    next90Days: number
    riskAmount: number
    highProbabilityAmount: number
  }
}

// Payment probability based on customer payment history and invoice status
interface PaymentProbability {
  status: PaymentStatus
  daysOverdue: number
  probability: {
    expected: number
    optimistic: number
    pessimistic: number
  }
}

// Calculate payment probability based on status and days overdue
function calculatePaymentProbability(status: PaymentStatus, daysOverdue: number): PaymentProbability["probability"] {
  switch (status) {
    case "paid":
      return { expected: 1, optimistic: 1, pessimistic: 1 }
    case "partial":
      return { expected: 0.8, optimistic: 0.95, pessimistic: 0.6 }
    case "unpaid":
      if (daysOverdue < 0) {
        // Not yet due
        return { expected: 0.9, optimistic: 0.98, pessimistic: 0.7 }
      } else if (daysOverdue <= 7) {
        // Up to 7 days overdue
        return { expected: 0.8, optimistic: 0.9, pessimistic: 0.6 }
      } else if (daysOverdue <= 30) {
        // Up to 30 days overdue
        return { expected: 0.6, optimistic: 0.8, pessimistic: 0.4 }
      } else {
        // More than 30 days overdue
        return { expected: 0.4, optimistic: 0.6, pessimistic: 0.2 }
      }
    case "overdue":
      if (daysOverdue <= 15) {
        return { expected: 0.7, optimistic: 0.85, pessimistic: 0.5 }
      } else if (daysOverdue <= 30) {
        return { expected: 0.5, optimistic: 0.7, pessimistic: 0.3 }
      } else if (daysOverdue <= 60) {
        return { expected: 0.3, optimistic: 0.5, pessimistic: 0.1 }
      } else {
        return { expected: 0.2, optimistic: 0.4, pessimistic: 0.05 }
      }
    case "cancelled":
      return { expected: 0, optimistic: 0.1, pessimistic: 0 }
    default:
      return { expected: 0.5, optimistic: 0.7, pessimistic: 0.3 }
  }
}

// Predict when an invoice will be paid based on due date and status
function predictPaymentDate(invoice: InvoiceData): Date {
  if (invoice.paymentStatus === "paid") {
    return invoice.paymentDate || new Date()
  }

  // For unpaid invoices, estimate based on due date
  const dueDate = new Date(invoice.paymentDueDate)

  // Add delay based on status
  switch (invoice.paymentStatus) {
    case "partial":
      return addDays(dueDate, 7) // Assume 7 days after due date
    case "unpaid":
      return dueDate // Assume on due date
    case "overdue":
      // Already overdue, predict payment in the next 14 days
      return addDays(new Date(), 14)
    default:
      return dueDate
  }
}

// Generate date range for cash flow prediction
function generateDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i))
  }
  return dates
}

// Group data by week
function groupByWeek(dailyData: CashFlowDataPoint[]): CashFlowDataPoint[] {
  const weeklyData: CashFlowDataPoint[] = []
  let currentWeek: CashFlowDataPoint | null = null

  dailyData.forEach((day, index) => {
    // Start a new week on Mondays or at the beginning
    if (day.date.getDay() === 1 || index === 0) {
      if (currentWeek) {
        weeklyData.push(currentWeek)
      }
      currentWeek = {
        date: new Date(day.date),
        expected: day.expected,
        optimistic: day.optimistic,
        pessimistic: day.pessimistic,
        cumulative: day.cumulative,
        cumulativeOptimistic: day.cumulativeOptimistic,
        cumulativePessimistic: day.cumulativePessimistic,
      }
    } else if (currentWeek) {
      currentWeek.expected += day.expected
      currentWeek.optimistic += day.optimistic
      currentWeek.pessimistic += day.pessimistic
      currentWeek.cumulative = day.cumulative
      currentWeek.cumulativeOptimistic = day.cumulativeOptimistic
      currentWeek.cumulativePessimistic = day.cumulativePessimistic
    }
  })

  // Add the last week if it exists
  if (currentWeek) {
    weeklyData.push(currentWeek)
  }

  return weeklyData
}

// Group data by month
function groupByMonth(dailyData: CashFlowDataPoint[]): CashFlowDataPoint[] {
  const monthlyData: CashFlowDataPoint[] = []
  let currentMonth: CashFlowDataPoint | null = null
  let currentMonthStr = ""

  dailyData.forEach((day) => {
    const monthStr = format(day.date, "yyyy-MM")

    if (monthStr !== currentMonthStr) {
      if (currentMonth) {
        monthlyData.push(currentMonth)
      }
      currentMonthStr = monthStr
      currentMonth = {
        date: new Date(day.date),
        expected: day.expected,
        optimistic: day.optimistic,
        pessimistic: day.pessimistic,
        cumulative: day.cumulative,
        cumulativeOptimistic: day.cumulativeOptimistic,
        cumulativePessimistic: day.cumulativePessimistic,
      }
    } else if (currentMonth) {
      currentMonth.expected += day.expected
      currentMonth.optimistic += day.optimistic
      currentMonth.pessimistic += day.pessimistic
      currentMonth.cumulative = day.cumulative
      currentMonth.cumulativeOptimistic = day.cumulativeOptimistic
      currentMonth.cumulativePessimistic = day.cumulativePessimistic
    }
  })

  // Add the last month if it exists
  if (currentMonth) {
    monthlyData.push(currentMonth)
  }

  return monthlyData
}

// Calculate days overdue
function calculateDaysOverdue(dueDate: Date, today: Date): number {
  const due = new Date(dueDate)
  const diff = today.getTime() - due.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Main function to predict cash flow
export function predictCashFlow(invoices: InvoiceData[], forecastDays = 90): CashFlowPrediction {
  const today = new Date()
  const dateRange = generateDateRange(today, forecastDays)

  // Initialize daily cash flow data
  const dailyData: CashFlowDataPoint[] = dateRange.map((date) => ({
    date,
    expected: 0,
    optimistic: 0,
    pessimistic: 0,
    cumulative: 0,
    cumulativeOptimistic: 0,
    cumulativePessimistic: 0,
  }))

  // Calculate expected payments for each invoice
  invoices.forEach((invoice) => {
    // Skip already paid invoices
    if (invoice.paymentStatus === "paid") {
      return
    }

    const daysOverdue = calculateDaysOverdue(invoice.paymentDueDate, today)
    const probability = calculatePaymentProbability(invoice.paymentStatus, daysOverdue)
    const predictedDate = predictPaymentDate(invoice)

    // Find the index in our date range
    const dateIndex = dateRange.findIndex(
      (date) =>
        date.getDate() === predictedDate.getDate() &&
        date.getMonth() === predictedDate.getMonth() &&
        date.getFullYear() === predictedDate.getFullYear(),
    )

    // If the predicted date is within our forecast period
    if (dateIndex >= 0) {
      const remainingAmount =
        invoice.paymentStatus === "partial" ? invoice.total - (invoice.paymentAmount || 0) : invoice.total

      dailyData[dateIndex].expected += remainingAmount * probability.expected
      dailyData[dateIndex].optimistic += remainingAmount * probability.optimistic
      dailyData[dateIndex].pessimistic += remainingAmount * probability.pessimistic
    }
  })

  // Calculate cumulative values
  let cumulativeExpected = 0
  let cumulativeOptimistic = 0
  let cumulativePessimistic = 0

  dailyData.forEach((day) => {
    cumulativeExpected += day.expected
    cumulativeOptimistic += day.optimistic
    cumulativePessimistic += day.pessimistic

    day.cumulative = cumulativeExpected
    day.cumulativeOptimistic = cumulativeOptimistic
    day.cumulativePessimistic = cumulativePessimistic
  })

  // Group by week and month
  const weeklyData = groupByWeek(dailyData)
  const monthlyData = groupByMonth(dailyData)

  // Calculate summary metrics
  const next30DaysData = dailyData.slice(0, 30)
  const next60DaysData = dailyData.slice(0, 60)
  const next90DaysData = dailyData.slice(0, 90)

  const totalExpected = dailyData.reduce((sum, day) => sum + day.expected, 0)
  const next30Days = next30DaysData.reduce((sum, day) => sum + day.expected, 0)
  const next60Days = next60DaysData.reduce((sum, day) => sum + day.expected, 0)
  const next90Days = next90DaysData.reduce((sum, day) => sum + day.expected, 0)

  // Calculate risk amount (difference between optimistic and pessimistic)
  const riskAmount = dailyData.reduce((sum, day) => sum + (day.optimistic - day.pessimistic), 0)

  // High probability amount (pessimistic scenario)
  const highProbabilityAmount = dailyData.reduce((sum, day) => sum + day.pessimistic, 0)

  return {
    dailyData,
    weeklyData,
    monthlyData,
    summary: {
      totalExpected,
      next30Days,
      next60Days,
      next90Days,
      riskAmount,
      highProbabilityAmount,
    },
  }
}

// Format date for display
export function formatDateForDisplay(date: Date): string {
  return format(date, "dd. MMM", { locale: de })
}

// Format month for display
export function formatMonthForDisplay(date: Date): string {
  return format(date, "MMM yyyy", { locale: de })
}

// Format week for display
export function formatWeekForDisplay(date: Date): string {
  const weekStart = format(date, "dd.", { locale: de })
  const weekEnd = format(addDays(date, 6), "dd. MMM", { locale: de })
  return `${weekStart} - ${weekEnd}`
}
