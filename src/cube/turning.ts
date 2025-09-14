import * as THREE from 'three'
import { step } from './constants'
import type { Axis } from './cube'
import { cubeGroup, selectLayer } from './cube'

export type TurnCmd = { axis: Axis; index: -1 | 0 | 1; angle: number }

const turnQueue: TurnCmd[] = []
let turnInProgress: null | {
  group: THREE.Group
  axis: Axis
  targetAngle: number
  rotated: number
  index: -1 | 0 | 1
} = null

export function queueTurn(cmd: TurnCmd) {
  turnQueue.push(cmd)
}

export function hasPendingTurns() {
  return turnQueue.length > 0
}

export function isTurnInProgress() {
  return !!turnInProgress
}

export function startNextTurn() {
  const next = turnQueue.shift()
  if (!next) return

  const group = new THREE.Group()
  cubeGroup.add(group)
  const layer = selectLayer(next.axis, next.index)
  for (const obj of layer) group.attach(obj as THREE.Object3D)

  turnInProgress = {
    group,
    axis: next.axis,
    targetAngle: next.angle,
    rotated: 0,
    index: next.index
  }
}

function finishTurn() {
  if (!turnInProgress) return
  const { group } = turnInProgress

  while (group.children.length) {
    const child = group.children[0]
    cubeGroup.attach(child)
    child.position.set(
      Math.round(child.position.x / step) * step,
      Math.round(child.position.y / step) * step,
      Math.round(child.position.z / step) * step
    )
    child.rotation.x = Math.round(child.rotation.x / (Math.PI / 2)) * (Math.PI / 2)
    child.rotation.y = Math.round(child.rotation.y / (Math.PI / 2)) * (Math.PI / 2)
    child.rotation.z = Math.round(child.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
  }

  cubeGroup.remove(group)
  turnInProgress = null
}

export function updateTurn(delta: number) {
  if (!turnInProgress) return
  const speed = Math.PI // rad/s
  const remaining = Math.abs(turnInProgress.targetAngle - turnInProgress.rotated)
  const stepAngle = Math.min(remaining, speed * delta)
  const signedStep = Math.sign(turnInProgress.targetAngle) * stepAngle

  switch (turnInProgress.axis) {
    case 'x':
      turnInProgress.group.rotateX(signedStep)
      break
    case 'y':
      turnInProgress.group.rotateY(signedStep)
      break
    case 'z':
      turnInProgress.group.rotateZ(signedStep)
      break
  }
  turnInProgress.rotated += signedStep

  if (Math.abs(turnInProgress.rotated - turnInProgress.targetAngle) < 1e-4) {
    const leftover = turnInProgress.targetAngle - turnInProgress.rotated
    if (Math.abs(leftover) > 1e-6) {
      switch (turnInProgress.axis) {
        case 'x':
          turnInProgress.group.rotateX(leftover)
          break
        case 'y':
          turnInProgress.group.rotateY(leftover)
          break
        case 'z':
          turnInProgress.group.rotateZ(leftover)
          break
      }
    }
    finishTurn()
  }
}

// Face helpers (uppercase = clockwise as viewed from the face)
export function turnFace(face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B', ccw = false) {
  let axis: Axis
  let index: -1 | 0 | 1
  let angle = 0

  switch (face) {
    case 'U':
      axis = 'y'
      index = 1
      angle = -Math.PI / 2
      break
    case 'D':
      axis = 'y'
      index = -1
      angle = Math.PI / 2
      break
    case 'R':
      axis = 'x'
      index = 1
      angle = -Math.PI / 2
      break
    case 'L':
      axis = 'x'
      index = -1
      angle = Math.PI / 2
      break
    case 'F':
      axis = 'z'
      index = 1
      angle = -Math.PI / 2
      break
    case 'B':
      axis = 'z'
      index = -1
      angle = Math.PI / 2
      break
  }

  if (ccw) angle = -angle
  queueTurn({ axis, index, angle })
}
