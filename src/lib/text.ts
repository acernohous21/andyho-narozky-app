/** Odstraní diakritiku, velká písmena a přebytečné mezery. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchesAnswer(guess: string, answers: string[]): boolean {
  const g = normalize(guess)
  if (!g) return false
  return answers.some((a) => {
    const n = normalize(a)
    return n.length > 0 && g.includes(n)
  })
}
