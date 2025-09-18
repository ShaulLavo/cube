import {
	initThree,
	renderer,
	scene,
	camera,
	controls,
	bloomPass,
	enableBloomPostFX,
	loadEnvironmentEXR,
	setDpr,
	setNativeDpr
} from './threeSetup'
import { buildCube, cubeGroup } from './cube/cube'
import { animateAlgorithm } from './cube/alg'
import { turnFace } from './cube/turning'
import { startAutoLoop, stopAutoLoop, isAutoLoopRunning } from './cube/auto'
import {
	ensureSolver,
	solutionForCurrent,
	generateSolverScramble
} from './cube/model'
import { cubeSpin, setSpin, setZoomEnabled } from './cube/uiState'
import { updateFloating } from './cube/float'
import { hasPendingTurns, startNextTurn } from './cube/turning'
import { renderScene } from './threeSetup'
import * as THREE from 'three'

export type SolveOptions = { animate?: boolean }
export type ScrambleOptions = { animate?: boolean }

let initialized = false
export async function init(canvas?: HTMLCanvasElement) {
    if (initialized) return
    await initThree({ canvas, enableBloom: true, enableEnv: true })
	if (!scene.children.includes(cubeGroup)) scene.add(cubeGroup)
	buildCube()
	ensureSolver()

	try {
		const box = new THREE.Box3().setFromObject(cubeGroup)
		const sphere = box.getBoundingSphere(new THREE.Sphere())
		const r = sphere.radius
		const fill = 0.94
		const fov = (camera.fov * Math.PI) / 180
		const d = r / (fill * Math.tan(fov / 2))

		controls.minDistance = Math.min(
			controls.minDistance,
			Math.max(0.1, d * 0.5)
		)
		const dir = camera.position.clone().sub(controls.target).normalize()
		camera.position.copy(controls.target.clone().add(dir.multiplyScalar(d)))
		camera.lookAt(controls.target)
		controls.update()
	} catch {}
	initialized = true
}

export function getCanvas() {
	return renderer.domElement
}

export function getThree() {
	return { renderer, scene, camera, controls, bloomPass }
}

export async function enableBloom() {
	await enableBloomPostFX()
}

export async function loadEnvEXR(url: string) {
	await loadEnvironmentEXR(url)
}

export function setPixelRatio(value: number) {
	setDpr(value)
}

export function setPixelRatioNative(maxCap?: number | null) {
	setNativeDpr(maxCap ?? null)
}

export async function scramble(opts: ScrambleOptions = {}) {
	const { animate = true } = opts
	const seq = await generateSolverScramble()
	if (animate) animateAlgorithm(seq)
	return seq
}

export async function solve(opts: SolveOptions = {}) {
	const { animate = true } = opts
	const alg = await solutionForCurrent()
	if (animate) animateAlgorithm(alg)
	return alg
}

export function move(
	face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B',
	ccw = false,
	profile: 'manual' | 'auto' = 'manual'
) {
	turnFace(face, ccw, profile)
}

export function runAlgorithm(alg: string) {
	animateAlgorithm(alg)
}

export function autoLoopStart() {
	startAutoLoop()
}
export function autoLoopStop() {
	stopAutoLoop()
}
export function autoLoopIsRunning() {
	return isAutoLoopRunning()
}

export function setSpinOptions(state: Partial<typeof cubeSpin>) {
	setSpin(state)
}

export function setZoom(on: boolean) {
	setZoomEnabled(on)
}

export type { SpinState } from './cube/uiState'

export function start() {
    let lastT = 0
    function loop(t = 0) {
        const dt = lastT ? (t - lastT) / 1000 : 0
        lastT = t

        if (cubeSpin.enabled) {
            cubeGroup.rotation.x += cubeSpin.speedX * dt
            cubeGroup.rotation.y += cubeSpin.speedY * dt
        }
        controls.update()
        if (hasPendingTurns()) startNextTurn()
        updateFloating(dt)
        renderScene()
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
}
