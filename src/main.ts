import * as THREE from 'three'
import { animateAlgorithm } from './cube/alg'
import { isAutoLoopRunning, startAutoLoop, stopAutoLoop } from './cube/auto'
import { buildCube, cubeGroup } from './cube/cube'
import {
	ensureSolver,
	generateSolverScramble,
	solutionForCurrent
} from './cube/model'
import { hasPendingTurns, startNextTurn, turnFace } from './cube/turning'
import { cubeSpin } from './cube/uiState'
import './style.css'
import { updateFloating } from './cube/float'
import { camera, controls, onResize, renderScene } from './threeSetup'

buildCube()
;(function fitCameraToCube() {
	const box = new THREE.Box3().setFromObject(cubeGroup)
	const sphere = box.getBoundingSphere(new THREE.Sphere())
	const r = sphere.radius
	const fill = 0.92
	const fov = (camera.fov * Math.PI) / 180
	const d = r / (fill * Math.tan(fov / 2))
	const dir = camera.position.clone().sub(controls.target).normalize()
	camera.position.copy(controls.target.clone().add(dir.multiplyScalar(d)))
	camera.lookAt(controls.target)
	controls.update()
})()
ensureSolver()
const FACE_LETTERS = ['U', 'D', 'L', 'R', 'F', 'B'] as const
const isFaceLetter = (s: any): s is (typeof FACE_LETTERS)[number] =>
	FACE_LETTERS.includes(s)

window.addEventListener('keydown', e => {
	const k = e.key
	const face = k.toUpperCase()

	if (isFaceLetter(face)) {
		const ccw = k !== face
		turnFace(face, ccw)
		return
	}

	if (face === 'S') {
		ensureSolver()
		;(async () => {
			const scramble = await generateSolverScramble()
			animateAlgorithm(scramble)
			console.log('Scramble:', scramble)
		})()
		return
	}

	if (face === 'P') {
		;(async () => {
			const alg = await solutionForCurrent()
			animateAlgorithm(alg)
			console.log('Solution:', alg)
		})()
		return
	}

	if (face === 'A') {
		if (isAutoLoopRunning()) {
			stopAutoLoop()
			console.log('Auto loop: stopped')
		} else {
			startAutoLoop()
			console.log('Auto loop: started')
		}
		return
	}

	if (face === 'O') {
		cubeSpin.enabled = !cubeSpin.enabled
		console.log(`Cube spin: ${cubeSpin.enabled ? 'enabled' : 'disabled'}`)
		return
	}

	// Bloom and glare controls removed
})

window.addEventListener('resize', onResize)

let lastT = 0
function animate(t = 0) {
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
	requestAnimationFrame(animate)
}

renderScene()
animate()

startAutoLoop()
