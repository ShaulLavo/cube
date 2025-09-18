import { controls } from '../threeSetup'

export type SpinState = {
  enabled: boolean
  speedX: number
  speedY: number
}

export const cubeSpin: SpinState = {
  enabled: true,
  speedX: 0.3,
  speedY: 0.15
}

export function setSpin(state: Partial<SpinState>) {
  Object.assign(cubeSpin, state)
}

// Glare and bloom controls removed

export function setZoomEnabled(enabled: boolean) {
  if (!controls) return
  controls.enableZoom = enabled
}
