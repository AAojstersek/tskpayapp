/**
 * Helper functions to convert between database format (snake_case) and TypeScript types (camelCase)
 */

export function dbToType<T extends Record<string, unknown>>(
  dbData: Record<string, unknown>
): T {
  const converted: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(dbData)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    
    // Handle boolean conversion (SQLite stores as INTEGER 0/1)
    if (value === 0 || value === 1) {
      if (key.includes('imported_from_bank') || key === 'is_recurring') {
        converted[camelKey] = value === 1
      } else {
        converted[camelKey] = value
      }
    } else {
      converted[camelKey] = value
    }
  }
  
  return converted as T
}

export function typeToDb<T extends Record<string, unknown>>(
  typeData: T
): Record<string, unknown> {
  const converted: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(typeData)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    
    // Handle boolean conversion (SQLite stores as INTEGER 0/1)
    if (typeof value === 'boolean') {
      converted[snakeKey] = value ? 1 : 0
    } else if (value === null || value === undefined) {
      // Preserve null/undefined as null
      converted[snakeKey] = null
    } else {
      converted[snakeKey] = value
    }
  }
  
  return converted
}

/**
 * Convert database cost to TypeScript Cost type
 * (needs special handling for cost_type_id -> costType)
 */
export function dbCostToType(dbCost: Record<string, unknown>, costTypeName: string): Record<string, unknown> {
  const converted = dbToType(dbCost)
  // Replace cost_type_id with costType (string name)
  delete converted.costTypeId
  converted.costType = costTypeName
  return converted
}

/**
 * Convert TypeScript Cost type to database format
 * (needs special handling for costType -> cost_type_id)
 */
export async function typeCostToDb(
  cost: Record<string, unknown>,
  db: { costTypes: { getAll: () => Promise<Array<Record<string, unknown>>> } }
): Promise<Record<string, unknown>> {
  const converted = typeToDb(cost)
  // Find cost_type_id by name
  const costTypes = await db.costTypes.getAll()
  const costType = costTypes.find((ct) => ct.name === cost.costType)
  
  if (costType) {
    delete converted.costType
    converted.cost_type_id = costType.id
  }
  
  return converted
}
