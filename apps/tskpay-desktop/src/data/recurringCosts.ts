import type { Cost } from '@/types'
import { appStore } from './appStore'

/**
 * Izračuna naslednji datum za ponavljajoči strošek
 */
export function calculateNextDueDate(
  template: Cost,
  lastDate: string | null
): string | null {
  if (!template.recurringPeriod || !template.recurringStartDate) {
    return null
  }

  const startDate = new Date(template.recurringStartDate)
  const baseDate = lastDate ? new Date(lastDate) : startDate
  const nextDate = new Date(baseDate)

  switch (template.recurringPeriod) {
    case 'monthly': {
      nextDate.setMonth(nextDate.getMonth() + 1)
      // Nastavi dan v mesecu, če je določen
      if (template.recurringDayOfMonth) {
        const day = Math.min(
          template.recurringDayOfMonth,
          new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
        )
        nextDate.setDate(day)
      }
      break
    }
    case 'quarterly': {
      nextDate.setMonth(nextDate.getMonth() + 3)
      if (template.recurringDayOfMonth) {
        const day = Math.min(
          template.recurringDayOfMonth,
          new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
        )
        nextDate.setDate(day)
      }
      break
    }
    case 'yearly': {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
    }
    case 'weekly': {
      nextDate.setDate(nextDate.getDate() + 7)
      break
    }
  }

  return nextDate.toISOString().split('T')[0]
}

/**
 * Preveri, ali je čas za generiranje stroška
 */
export function shouldGenerateCost(
  template: Cost,
  currentDate: Date = new Date()
): boolean {
  if (!template.isRecurring || !template.recurringPeriod || !template.recurringStartDate) {
    return false
  }

  const startDate = new Date(template.recurringStartDate)
  
  // Preveri, ali je že pretekel začetni datum
  if (currentDate < startDate) {
    return false
  }

  // Preveri, ali je že pretekel končni datum
  if (template.recurringEndDate) {
    const endDate = new Date(template.recurringEndDate)
    if (currentDate > endDate) {
      return false
    }
  }

  return true
}

/**
 * Preveri, ali že obstaja strošek za določeno obdobje
 */
function costExistsForPeriod(
  template: Cost,
  dueDate: string,
  allCosts: Cost[]
): boolean {
  return allCosts.some(
    (cost) =>
      cost.memberId === template.memberId &&
      cost.costType === template.costType &&
      cost.dueDate === dueDate &&
      (cost.recurringTemplateId === template.id || cost.id === template.id)
  )
}

/**
 * Generira naslednji strošek iz template-a
 */
function generateNextCost(template: Cost, allCosts: Cost[]): Cost | null {
  if (!shouldGenerateCost(template)) {
    return null
  }

  // Poišči zadnji generirani strošek za ta template
  const generatedCosts = allCosts.filter(
    (c) => c.recurringTemplateId === template.id
  )
  
  const lastCost = generatedCosts.length > 0
    ? generatedCosts.sort((a, b) => 
        (b.dueDate || '').localeCompare(a.dueDate || '')
      )[0]
    : null

  const lastDate = lastCost?.dueDate || template.dueDate || template.recurringStartDate
  if (!lastDate) {
    return null
  }

  const nextDueDate = calculateNextDueDate(template, lastDate)
  if (!nextDueDate) {
    return null
  }

  // Preveri, ali že obstaja strošek za to obdobje
  if (costExistsForPeriod(template, nextDueDate, allCosts)) {
    return null
  }

  // Preveri, ali je še v obdobju ponavljanja
  if (template.recurringEndDate) {
    const endDate = new Date(template.recurringEndDate)
    const nextDate = new Date(nextDueDate)
    if (nextDate > endDate) {
      return null
    }
  }

  // Generiraj naslednji strošek
  const nextCost: Omit<Cost, 'id' | 'createdAt'> = {
    memberId: template.memberId,
    title: generateTitleForPeriod(template.title, nextDueDate, template.recurringPeriod),
    description: template.description,
    amount: template.amount,
    costType: template.costType,
    dueDate: nextDueDate,
    status: 'pending',
    isRecurring: false, // Generirani stroški niso ponavljajoči
    recurringPeriod: null,
    recurringStartDate: null,
    recurringEndDate: null,
    recurringDayOfMonth: null,
    recurringTemplateId: template.id,
  }

  return nextCost as Cost
}

/**
 * Generira naslov za obdobje (npr. "Vadnine - Januar 2024" -> "Vadnine - Februar 2024")
 */
function generateTitleForPeriod(
  baseTitle: string,
  dueDate: string,
  period: string
): string {
  const date = new Date(dueDate)
  
  // Poskusi najti mesec/leto v naslovu in ga zamenjaj
  const monthNames = [
    'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
    'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'
  ]
  
  const monthName = monthNames[date.getMonth()]
  const year = date.getFullYear()

  // Preveri, ali naslov že vsebuje mesec/leto
  const hasMonthYear = /(Januar|Februar|Marec|April|Maj|Junij|Julij|Avgust|September|Oktober|November|December)\s+\d{4}/.test(baseTitle)
  
  if (hasMonthYear) {
    // Zamenjaj mesec in leto
    return baseTitle.replace(
      /(Januar|Februar|Marec|April|Maj|Junij|Julij|Avgust|September|Oktober|November|December)\s+\d{4}/,
      `${monthName} ${year}`
    )
  }

  // Dodaj mesec in leto na konec
  return `${baseTitle} - ${monthName} ${year}`
}

/**
 * Generira vse manjkajoče ponavljajoče stroške
 */
export async function generateRecurringCosts(): Promise<number> {
  const state = appStore.getState()
  const allCosts = state.costs
  const templates = allCosts.filter((cost) => cost.isRecurring && !cost.recurringTemplateId)

  let generatedCount = 0
  const currentDate = new Date()

  for (const template of templates) {
    if (!shouldGenerateCost(template, currentDate)) {
      continue
    }

    // Generiraj stroške, dokler je potrebno
    // Omejimo na 12 mesečnih generiranj naenkrat, da ne generiramo preveč
    let maxGenerations = 12
    let lastGenerated: Cost | null = null

    while (maxGenerations > 0) {
      const nextCost = generateNextCost(template, allCosts)
      
      if (!nextCost) {
        break
      }

      // Preveri, ali je datum v prihodnosti ali blizu (v naslednjih 30 dneh)
      const nextDate = new Date(nextCost.dueDate || '')
      const daysDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Generiraj samo stroške, ki so v prihodnosti ali v naslednjih 30 dneh
      if (daysDiff > 30) {
        break
      }

      try {
        await appStore.create('costs', nextCost)
        generatedCount++
        lastGenerated = nextCost as Cost
        // Dodaj v lokalni seznam za naslednje preverjanje
        allCosts.push(nextCost as Cost)
      } catch (error) {
        console.error('Failed to generate recurring cost:', error)
        break
      }

      maxGenerations--
    }
  }

  return generatedCount
}
