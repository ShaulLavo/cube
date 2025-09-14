import * as THREE from 'three'
import { cubeSize } from './constants'

// Base plastic material and sticker colors
const plastic = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.5,
  metalness: 0.1
})
const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
const matYellow = new THREE.MeshStandardMaterial({ color: 0xffd500, roughness: 0.3 })
const matRed = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.3 })
const matOrange = new THREE.MeshStandardMaterial({ color: 0xff8f00, roughness: 0.3 })
const matBlue = new THREE.MeshStandardMaterial({ color: 0x0051ba, roughness: 0.3 })
const matGreen = new THREE.MeshStandardMaterial({ color: 0x009e60, roughness: 0.3 })

// Order: [right, left, top, bottom, front, back]
export function materialsFor(i: number, j: number, k: number) {
  const right = i === 1 ? matRed : plastic
  const left = i === -1 ? matOrange : plastic
  const top = j === 1 ? matWhite : plastic
  const bottom = j === -1 ? matYellow : plastic
  const front = k === 1 ? matGreen : plastic
  const back = k === -1 ? matBlue : plastic
  return [right, left, top, bottom, front, back]
}

// Shared geometry for all cubelets
export const cubeletGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

