import * as THREE from 'three'
import { step } from './constants'
import { cubeletGeometry, materialsFor } from './materials'

export type Cubelet = {
  mesh: THREE.Mesh
}

export const cubeGroup = new THREE.Group()
export const cubelets: Cubelet[] = []

export function buildCube() {
  if (cubelets.length) return // already built
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        const mats = materialsFor(i, j, k)
        const cubelet = new THREE.Mesh(cubeletGeometry, mats)
        cubelet.castShadow = false
        cubelet.receiveShadow = false
        cubelet.position.set(i * step, j * step, k * step)
        cubeGroup.add(cubelet)
        cubelets.push({ mesh: cubelet })
      }
    }
  }
}

export type Axis = 'x' | 'y' | 'z'

export function selectLayer(axis: Axis, index: -1 | 0 | 1) {
  const selected: THREE.Object3D[] = []
  for (const { mesh } of cubelets) {
    if (axis === 'x' && Math.round(mesh.position.x / step) === index) selected.push(mesh)
    if (axis === 'y' && Math.round(mesh.position.y / step) === index) selected.push(mesh)
    if (axis === 'z' && Math.round(mesh.position.z / step) === index) selected.push(mesh)
  }
  return selected
}

