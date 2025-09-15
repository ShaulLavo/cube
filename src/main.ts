import { animateAlgorithm } from './cube/alg'
import { generateSolverScramble } from './cube/model'
import { isAutoLoopRunning, startAutoLoop, stopAutoLoop } from './cube/auto'
import { buildCube, cubeGroup } from './cube/cube'
import { ensureSolver, solutionForCurrent } from './cube/model'
import { hasPendingTurns, startNextTurn, turnFace } from './cube/turning'
import './style.css'
import {
	controls,
	onResize,
	scene,
	renderScene,
	renderer,
	bloomPass
} from './threeSetup'
import * as THREE from 'three'
// import { mountKeymap } from './ui/keymap'
// import { mountCamHUD } from './ui/camHud'
// Add cube to the scene
scene.add(cubeGroup)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)
buildCube()
ensureSolver()

// Keyboard controls: U D L R F B (lowercase = counterclockwise)
window.addEventListener('keydown', e => {
	const k = e.key
	const face = k.toUpperCase()

	if (['U', 'D', 'L', 'R', 'F', 'B'].includes(face)) {
		// Allow input during turns: enqueue the move
		const ccw = k !== face // lowercase => counterclockwise
		turnFace(face as any, ccw)
		return
	}

	// Scramble: key 'S'
	if (face === 'S') {
    ensureSolver()
    ;(async () => {
      const scramble = await generateSolverScramble()
      animateAlgorithm(scramble)
      console.log('Scramble:', scramble)
    })()
    return
  }

	// Solve: key 'P'
	if (face === 'P') {
		;(async () => {
			const alg = await solutionForCurrent()
			animateAlgorithm(alg)
			console.log('Solution:', alg)
		})()
		return
	}

	// Auto loop: key 'A' (toggle)
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

	// Cube auto-spin toggle: key 'O'
	if (face === 'O') {
		cubeSpin.enabled = !cubeSpin.enabled
		console.log(`Cube spin: ${cubeSpin.enabled ? 'enabled' : 'disabled'}`)
		return
	}

	// Bloom toggle: key 'B'
	if (face === 'B') {
		bloomPass.enabled = !bloomPass.enabled
		console.log(`Bloom: ${bloomPass.enabled ? 'on' : 'off'}`)
		return
	}

	// Glare-safe toggle: key 'G' (adjust exposure + bloom threshold/strength)
	if (face === 'G') {
		glareSafe.enabled = !glareSafe.enabled
		if (glareSafe.enabled) {
			renderer.toneMappingExposure = 0.7
			bloomPass.threshold = 0.97
			bloomPass.strength = 0.25
		} else {
			renderer.toneMappingExposure = 0.8
			bloomPass.threshold = 0.92
			bloomPass.strength = 0.35
		}
		console.log(`Glare-safe: ${glareSafe.enabled ? 'enabled' : 'disabled'}`)
		return
	}
})

// Resize handling
window.addEventListener('resize', onResize)

// Animation loop
const cubeSpin = {
	enabled: true,
	speedX: 0.3, // rad/sec
	speedY: 0.15 // rad/sec
}

const glareSafe = {
	enabled: false
}

let lastT = 0
function animate(t = 0) {
	const dt = lastT ? (t - lastT) / 1000 : 0
	lastT = t

	// Gentle cube auto-rotation around X and Y
	if (cubeSpin.enabled) {
		cubeGroup.rotation.x += cubeSpin.speedX * dt
		cubeGroup.rotation.y += cubeSpin.speedY * dt
	}

	controls.update()
	if (hasPendingTurns()) startNextTurn()
	renderScene()
	requestAnimationFrame(animate)
}

renderScene()
animate()

// HUDs hidden by default (keymap + camera HUD)

// Start auto loop by default
startAutoLoop()
