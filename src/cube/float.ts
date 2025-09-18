import { cubeGroup } from './cube'

let elapsed = 0
let prevBob = 0
let prevWobbleX = 0
let prevWobbleZ = 0

let hovered = false
let spinVelY = 0 // small, decaying spin velocity around Y

export function setHovered(v: boolean) {
  hovered = v
}

export function isHovered() {
  return hovered
}

export function addSpinImpulse(dxNormalized: number) {
  // dxNormalized is roughly in [-1, 1]; positive means mouse moved right
  // Apply a small impulse to spin velocity, inverted to feel natural
  const k = 0.015
  spinVelY += dxNormalized * k
  // Clamp to keep it gentle
  const max = 0.02
  if (spinVelY > max) spinVelY = max
  if (spinVelY < -max) spinVelY = -max
}

export function resetFloating() {
  // Remove any previously applied offsets
  cubeGroup.position.y -= prevBob
  cubeGroup.rotation.x -= prevWobbleX
  cubeGroup.rotation.z -= prevWobbleZ
  elapsed = 0
  prevBob = 0
  prevWobbleX = 0
  prevWobbleZ = 0
  spinVelY = 0
}

export function updateFloating(dt: number) {
  elapsed += dt

  // Gentle constant bobbing and subtle wobble
  const freq = 0.5
  const amp = 0.03

  const bob = Math.sin(elapsed * Math.PI * 2 * freq) * amp
  cubeGroup.position.y += bob - prevBob

  const wobbleX = Math.sin(elapsed * 0.6) * 0.01
  const wobbleZ = Math.sin(elapsed * 0.8 + Math.PI / 3) * 0.008
  cubeGroup.rotation.x += wobbleX - prevWobbleX
  cubeGroup.rotation.z += wobbleZ - prevWobbleZ

  // Apply small spin velocity with exponential decay
  cubeGroup.rotation.y += spinVelY
  const decay = Math.exp(-dt * 3.0)
  spinVelY *= decay

  prevBob = bob
  prevWobbleX = wobbleX
  prevWobbleZ = wobbleZ
}
