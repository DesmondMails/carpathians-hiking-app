// Compares primitives by value and flat arrays element by element,
// so ['EASY'] matches a different array with the same items
export const isSameValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  return a === b
}
