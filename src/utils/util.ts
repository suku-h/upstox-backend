export function isNull(obj: any): boolean {
  if (undefined === obj || null === obj) {
    return true
  }
  return false
}

export function isNotNull(obj: any): boolean {
  return !isNull(obj)
}

export function isEmptyString(obj: any): boolean {
  if (isNotNull(obj) && typeof obj === 'string' && obj.trim().length > 0) {
    return false
  }
  return true
}

export function isValidEmail(obj: any): boolean {
  if (!isEmptyString(obj)) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(obj)
  }
  return false
}