/** Calculate age from ISO birth date string. Returns null if invalid. */
export function calculateAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/** Format age for display. Shows dash if unknown. */
export function formatAge(birthDate: string | null | undefined): string {
  const age = calculateAge(birthDate)
  return age !== null ? String(age) : '\u2014'
}
