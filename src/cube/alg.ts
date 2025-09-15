import { turnFace } from './turning'

export type ParsedMove = { face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'; power: 0 | 1 | 2 }

export function parseAlgorithm(alg: string): ParsedMove[] {
  const parts = alg.trim().split(/\s+/)
  const out: ParsedMove[] = []
  for (const part of parts) {
    if (!part) continue
    const face = part[0] as ParsedMove['face']
    if (!'UDLRFB'.includes(face)) continue // ignore unsupported moves
    let power: 0 | 1 | 2 = 0
    if (part.length > 1) {
      if (part[1] === '2') power = 1
      else if (part[1] === "'") power = 2
    }
    out.push({ face, power })
  }
  return out
}

export function animateAlgorithm(alg: string) {
  const moves = parseAlgorithm(alg)
  for (const m of moves) {
    switch (m.power) {
      case 0:
        turnFace(m.face, false, 'auto')
        break
      case 1:
        // 180-degree turn: two quarter-turns
        turnFace(m.face, false, 'auto')
        turnFace(m.face, false, 'auto')
        break
      case 2:
        turnFace(m.face, true, 'auto')
        break
    }
  }
}
