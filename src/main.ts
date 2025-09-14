import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = document.querySelector('#app')!

// Scene & camera
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x222831)

const fov = 40
const aspect = container.clientWidth / container.clientHeight
const near = 0.1
const far = 100
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(6, 6, 10)

// Lights
const light = new THREE.DirectionalLight('white', 6)
light.position.set(10, 12, 8)
scene.add(new THREE.AmbientLight('white', 0.6))

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(window.devicePixelRatio)
container.append(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enablePan = false
controls.minDistance = 6
controls.maxDistance = 20

// Rubik's Cube setup
const cubeGroup = new THREE.Group()
scene.add(cubeGroup, light)

// Dimensions
const cubeSize = 1
const gap = 0.06
const step = cubeSize + gap

// Materials
const plastic = new THREE.MeshStandardMaterial({
	color: 0x111111,
	roughness: 0.5,
	metalness: 0.1
})
const matWhite = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	roughness: 0.3
})
const matYellow = new THREE.MeshStandardMaterial({
	color: 0xffd500,
	roughness: 0.3
})
const matRed = new THREE.MeshStandardMaterial({
	color: 0xc41e3a,
	roughness: 0.3
})
const matOrange = new THREE.MeshStandardMaterial({
	color: 0xff8f00,
	roughness: 0.3
})
const matBlue = new THREE.MeshStandardMaterial({
	color: 0x0051ba,
	roughness: 0.3
})
const matGreen = new THREE.MeshStandardMaterial({
	color: 0x009e60,
	roughness: 0.3
})

// Order of box materials: [right, left, top, bottom, front, back]
function materialsFor(i: number, j: number, k: number) {
	const right = i === 1 ? matRed : plastic
	const left = i === -1 ? matOrange : plastic
	const top = j === 1 ? matWhite : plastic
	const bottom = j === -1 ? matYellow : plastic
	const front = k === 1 ? matGreen : plastic
	const back = k === -1 ? matBlue : plastic
	return [right, left, top, bottom, front, back]
}

// Share one geometry for all cubelets
const cubeletGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

type Cubelet = {
	mesh: THREE.Mesh
}

const cubelets: Cubelet[] = []

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

// Turning logic
type Axis = 'x' | 'y' | 'z'
type TurnCmd = { axis: Axis; index: -1 | 0 | 1; angle: number }

const turnQueue: TurnCmd[] = []
let turnInProgress: null | {
	group: THREE.Group
	axis: Axis
	targetAngle: number
	rotated: number
	index: -1 | 0 | 1
} = null

function selectLayer(axis: Axis, index: -1 | 0 | 1) {
	const selected: THREE.Object3D[] = []
	for (const { mesh } of cubelets) {
		if (axis === 'x' && Math.round(mesh.position.x / step) === index)
			selected.push(mesh)
		if (axis === 'y' && Math.round(mesh.position.y / step) === index)
			selected.push(mesh)
		if (axis === 'z' && Math.round(mesh.position.z / step) === index)
			selected.push(mesh)
	}
	return selected
}

function queueTurn(cmd: TurnCmd) {
	turnQueue.push(cmd)
}

function startNextTurn() {
	const next = turnQueue.shift()
	if (!next) return

	const group = new THREE.Group()
	cubeGroup.add(group)
	const layer = selectLayer(next.axis, next.index)
	// Attach selected cubelets to the temp group preserving world transform
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

	// Snap to grid and reattach cubelets back to cubeGroup
	while (group.children.length) {
		const child = group.children[0]
		cubeGroup.attach(child)
		// Snap positions to the nearest step
		child.position.set(
			Math.round(child.position.x / step) * step,
			Math.round(child.position.y / step) * step,
			Math.round(child.position.z / step) * step
		)
		// Snap rotations to quarter turns
		child.rotation.x =
			Math.round(child.rotation.x / (Math.PI / 2)) * (Math.PI / 2)
		child.rotation.y =
			Math.round(child.rotation.y / (Math.PI / 2)) * (Math.PI / 2)
		child.rotation.z =
			Math.round(child.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
	}

	cubeGroup.remove(group)
	turnInProgress = null
}

function updateTurn(delta: number) {
	if (!turnInProgress) return
	const speed = Math.PI // rad/s
	const remaining = Math.abs(
		turnInProgress.targetAngle - turnInProgress.rotated
	)
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
		// Ensure exact final rotation
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
function turnFace(face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B', ccw = false) {
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

// Keyboard controls: U D L R F B (lowercase = counterclockwise)
window.addEventListener('keydown', e => {
	if (turnInProgress) return // prevent stacking interactive input mid-turn
	const k = e.key
	const face = k.toUpperCase()
	const isFace = ['U', 'D', 'L', 'R', 'F', 'B'].includes(face)
	if (!isFace) return
	const ccw = k !== face // lowercase => counterclockwise
	turnFace(face as any, ccw)
})

// Resize handling
function onResize() {
	const w = container.clientWidth
	const h = container.clientHeight
	camera.aspect = w / h
	camera.updateProjectionMatrix()
	renderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

// Animation loop
const clock = new THREE.Clock()
function animate() {
	const delta = clock.getDelta()
	controls.update()
	if (!turnInProgress && turnQueue.length) startNextTurn()
	updateTurn(delta)
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
}

renderer.render(scene, camera)
animate()
