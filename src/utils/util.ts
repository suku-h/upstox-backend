export function isNull(obj: any): boolean {
  if (undefined === obj || null === obj) {
    return true
  }
  return false
}

export function isNotNull(obj: any): boolean {
  return !isNull(obj)
}