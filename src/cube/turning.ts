import * as THREE from 'three'
import { animate, JSAnimation, createSpring } from 'animejs'
import { step } from './constants'
import type { Axis } from './cube'
import { cubeGroup, selectLayer } from './cube'
import { moveFace } from './model'

export type TurnCmd = {
	axis: Axis
	index: -1 | 0 | 1
	angle: number
	profile: 'manual' | 'auto'
	face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
	ccw: boolean
}

const turnQueue: TurnCmd[] = []

type ActiveTurn = {
	id: number
	group: THREE.Group
	axis: Axis
	targetAngle: number
	rotated: number
	index: -1 | 0 | 1
	profile: 'manual' | 'auto'
	face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
	ccw: boolean
	anim?: JSAnimation
}

let nextTurnId = 1
let activeTurns: ActiveTurn[] = []

export function queueTurn(cmd: TurnCmd) {
	turnQueue.push(cmd)
}

export function clearQueued(profile?: 'manual' | 'auto') {
	if (!profile) {
		turnQueue.length = 0
		return
	}
	for (let i = turnQueue.length - 1; i >= 0; i--) {
		if (turnQueue[i].profile === profile) turnQueue.splice(i, 1)
	}
}

export function hasPendingTurns() {
	return turnQueue.length > 0
}

export function isTurnInProgress() {
	return activeTurns.length > 0
}

export function cancelAllTurns() {
	turnQueue.length = 0

	for (const t of activeTurns) {
		if (t.anim) {
			try {
				t.anim.cancel()
			} catch {}
		}
	}

	while (activeTurns.length) finishTurn(activeTurns[0].id)
}

export function startNextTurn() {
	if (activeTurns.length >= 2) return

	const canRunWithActives = (cmd: TurnCmd) => {
		if (activeTurns.length === 0) return true
		if (activeTurns.length === 1) {
			const a = activeTurns[0]
			return a.axis === cmd.axis && a.index === -cmd.index
		}
		return false
	}

	if (turnQueue.length === 0) return

	const tryStart = (i: number) => {
		const next = turnQueue[i]
		if (!next) return false
		if (!canRunWithActives(next)) return false

		turnQueue.splice(i, 1)

		const group = new THREE.Group()
		cubeGroup.add(group)
		const layer = selectLayer(next.axis, next.index)
		for (const obj of layer) group.attach(obj as THREE.Object3D)

		const id = nextTurnId++
		const turn: ActiveTurn = {
			id,
			group,
			axis: next.axis,
			targetAngle: next.angle,
			rotated: 0,
			index: next.index,
			profile: next.profile,
			face: next.face,
			ccw: next.ccw
		}
		activeTurns.push(turn)

		const axis = next.axis
		const state = { angle: 0 }

		const onUpdate = () => {
			switch (axis) {
				case 'x':
					group.rotation.x = state.angle
					break
				case 'y':
					group.rotation.y = state.angle
					break
				case 'z':
					group.rotation.z = state.angle
					break
			}
			turn.rotated = state.angle
		}
		const onComplete = () => {
			const stillActive = activeTurns.find(t => t.id === id)
			if (stillActive) finishTurn(id)
		}
		const isManual = next.profile === 'manual'
		const anim = animate(state, {
			angle: {
				from: 0,
				to: next.angle,
				ease: isManual
					? createSpring({ mass: 0.1, stiffness: 220, damping: 6, velocity: 0 })
					: createSpring({
							mass: 0.5,
							stiffness: 220,
							damping: 11,
							velocity: 0
					  })
			},
			onUpdate,
			onComplete
		})
		turn.anim = anim
		return true
	}

	if (activeTurns.length === 0) {
		if (turnQueue.length > 0) tryStart(0)
	}

	if (activeTurns.length === 1 && turnQueue.length > 0) {
		const a = activeTurns[0]
		const c = turnQueue[0]
		if (c && c.axis === a.axis && c.index === -a.index) {
			tryStart(0)
		}
	}
}

function finishTurn(id: number) {
	const idx = activeTurns.findIndex(t => t.id === id)
	if (idx === -1) return
	const turn = activeTurns[idx]
	const { group } = turn

	while (group.children.length) {
		const child = group.children[0]
		cubeGroup.attach(child)
		child.position.set(
			Math.round(child.position.x / step) * step,
			Math.round(child.position.y / step) * step,
			Math.round(child.position.z / step) * step
		)
		child.rotation.x =
			Math.round(child.rotation.x / (Math.PI / 2)) * (Math.PI / 2)
		child.rotation.y =
			Math.round(child.rotation.y / (Math.PI / 2)) * (Math.PI / 2)
		child.rotation.z =
			Math.round(child.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
	}

	cubeGroup.remove(group)

	const { face, ccw } = turn
	moveFace(face, ccw)

	activeTurns.splice(idx, 1)

	if (turnQueue.length > 0) startNextTurn()
}

export function turnFace(
	face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B',
	ccw = false,
	profile: 'manual' | 'auto' = 'manual'
) {
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

	queueTurn({ axis, index, angle, profile, face, ccw })
}
