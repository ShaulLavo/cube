import * as THREE from 'three'
import { buildCube, cubeGroup } from './cube/cube'
import { updateFloating } from './cube/float'
import { hasPendingTurns, startNextTurn } from './cube/turning'
import { cubeSpin } from './cube/uiState'
import './style.css'
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
