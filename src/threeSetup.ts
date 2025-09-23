import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type {
	EffectComposer,
	EffectPass,
	BloomEffect,
	FXAAEffect
} from 'postprocessing'
import { cubeGroup } from './cube/cube'
import { setHovered, addSpinImpulse } from './cube/float'

export let scene: THREE.Scene
export let camera: THREE.PerspectiveCamera
export let renderer: THREE.WebGLRenderer
export let controls: OrbitControls
export let composer: EffectComposer | null = null
export let bloomPass: EffectPass | null = null
export let bloomEffect: BloomEffect | null = null
export let fxaaEffect: FXAAEffect | null = null

let initialized = false
let pmrem: THREE.PMREMGenerator | null = null
let envRT: THREE.WebGLRenderTarget | null = null
let pointerMoveHandler: ((ev: PointerEvent) => void) | null = null
let pointerLeaveHandler: ((ev: PointerEvent) => void) | null = null
let pointerTarget: HTMLCanvasElement | null = null

// Use the consuming app's public path so Vite serves it
// Avoid new URL(import.meta.url) which can resolve to @fs paths in deps
const DEFAULT_ENVIRONMENT_EXR_URL = '/Spruit Sunrise 4K.exr'

type InitOpts = {
	canvas?: HTMLCanvasElement
	width?: number
	height?: number
	enableBloom?: boolean
}
export async function initThree(opts: InitOpts = {}) {
	if (initialized) return
	const { canvas, width, height, enableBloom = false } = opts

	scene = new THREE.Scene()
	scene.background = null

	const fov = 40
	const near = 0.1
	const far = 100
	camera = new THREE.PerspectiveCamera(fov, 1, near, far)
	camera.position.set(10, -6, -11)

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas })
	const w = width ?? (canvas ? canvas.clientWidth || canvas.width : 360)
	const h = height ?? (canvas ? canvas.clientHeight || canvas.height : 360)
	renderer.setPixelRatio(window.devicePixelRatio || 1)
	// Only update the internal drawing buffer size. Let CSS control layout.
	// This avoids setting inline width/height that can fight responsive sizing
	// on first load before layout has fully settled.
	renderer.setSize(w || 360, h || 360, false)
	camera.aspect = (w || 360) / (h || 360)
	camera.updateProjectionMatrix()

	renderer.outputColorSpace = THREE.SRGBColorSpace
	renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.toneMappingExposure = 0.8
	renderer.setClearColor(0x000000, 0)
	renderer.setClearAlpha(0)
	const ambientLight = new THREE.AmbientLight(0xffffff, 1)
	scene.add(ambientLight)

	pmrem = new THREE.PMREMGenerator(renderer)

	const { OrbitControls: OC } = await import(
		'three/examples/jsm/controls/OrbitControls.js'
	)
	controls = new OC(camera, renderer.domElement)
	controls.enableDamping = true
	controls.dampingFactor = 0.05
	controls.enablePan = false
	controls.enableZoom = false
	controls.minDistance = 6
	controls.maxDistance = 20
	controls.target.set(0, 0, 0)
	controls.update()
	controls.saveState()

	const raycaster = new THREE.Raycaster()
	const pointer = new THREE.Vector2()
	let prevNX = 0
	let hadHover = false
	function updatePointerFromEvent(ev: PointerEvent) {
		const rect = renderer.domElement.getBoundingClientRect()
		pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
		pointer.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1)
	}
	function handlePointerMove(ev: PointerEvent) {
		updatePointerFromEvent(ev)
		raycaster.setFromCamera(pointer, camera)
		const intersects = raycaster.intersectObjects(cubeGroup.children, true)
		const hovering = intersects.length > 0
		setHovered(hovering)

		if (hovering) {
			const dx = pointer.x - prevNX
			if (hadHover) addSpinImpulse(dx)
			hadHover = true
		} else {
			hadHover = false
		}
		prevNX = pointer.x
	}
	function handlePointerLeave() {
		setHovered(false)
	}
	renderer.domElement.addEventListener('pointermove', handlePointerMove)
	renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
	pointerMoveHandler = handlePointerMove
	pointerLeaveHandler = handlePointerLeave
	pointerTarget = renderer.domElement

	if (enableBloom) {
		await enableBloomPostFX()
	}

	// Hardcoded environment map load so consumers don't need to call it
	await loadEnvironmentEXR(DEFAULT_ENVIRONMENT_EXR_URL)
	initialized = true

	// Nudge a couple of resizes across frames to catch late layout
	// (fonts, aspect changes) without relying on a window resize.
	try {
		requestAnimationFrame(() => {
			onResize()
			requestAnimationFrame(() => onResize())
		})
	} catch {}
}

export function disposeThree() {
	if (!initialized) return
	initialized = false

	if (pointerTarget && pointerMoveHandler) {
		pointerTarget.removeEventListener('pointermove', pointerMoveHandler)
	}
	if (pointerTarget && pointerLeaveHandler) {
		pointerTarget.removeEventListener('pointerleave', pointerLeaveHandler)
	}
	pointerMoveHandler = null
	pointerLeaveHandler = null
	pointerTarget = null

	try {
		controls?.dispose()
	} catch {}

	if (composer) {
		try {
			composer?.dispose?.()
		} catch {}
		composer = null
	}
	bloomPass = null
	bloomEffect = null
	fxaaEffect = null

	if (pmrem) {
		pmrem.dispose()
		pmrem = null
	}
	if (envRT) {
		envRT.dispose()
		envRT = null
	}

	try {
		renderer.dispose()
		;(renderer as any).forceContextLoss?.()
	} catch {}

	scene.clear()
	scene.environment = null
}

export function onResize() {
	if (!initialized) return
	const canvas = renderer.domElement
	const w = canvas.clientWidth || canvas.width || 360
	const h = canvas.clientHeight || canvas.height || 360
	camera.aspect = w / h
	camera.updateProjectionMatrix()
	// Keep CSS-driven layout; only update internal buffer size.
	renderer.setSize(w, h, false)
	if (composer) composer.setSize(w, h)
}

export function renderScene() {
	if (composer) composer.render()
	else renderer.render(scene, camera)
}

export async function enableBloomPostFX() {
	if (composer) return
	const [
		{
			EffectComposer: EC,
			RenderPass: RP,
			EffectPass: EP,
			BloomEffect: BE,
			FXAAEffect: FX
		}
	] = await Promise.all([import('postprocessing')])
	composer = new EC(renderer)

	try {
		const max = (renderer as any).capabilities?.maxSamples ?? 0
		if (max && 'multisampling' in (composer as any)) {
			;(composer as any).multisampling = Math.min(4, max)
		}
	} catch {}
	const renderPass = new RP(scene, camera)
	bloomEffect = new BE({
		intensity: 0.5,
		radius: 0.8,
		luminanceThreshold: 0.92
	})

	try {
		fxaaEffect = new FX()
		bloomPass = new EP(camera, fxaaEffect, bloomEffect)
	} catch {
		bloomPass = new EP(camera, bloomEffect)
	}
	composer.addPass(renderPass)
	composer.addPass(bloomPass)
}

export async function loadEnvironmentEXR(url: string) {
	try {
		if (!pmrem) pmrem = new THREE.PMREMGenerator(renderer)
		const { RoomEnvironment } = await import(
			'three/examples/jsm/environments/RoomEnvironment.js'
		)

		scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

		const { EXRLoader } = await import(
			'three/examples/jsm/loaders/EXRLoader.js'
		)
		const loader = new EXRLoader().setDataType(THREE.FloatType)
		const exr = await loader.loadAsync(url)
		if (envRT) envRT.dispose()
		envRT = pmrem.fromEquirectangular(exr)
		scene.environment = envRT.texture
	} catch (e) {
		console.warn('EXR env load failed:', e)
	}
}

export function setDpr(value: number) {
	if (!renderer) return
	const canvas = renderer.domElement
	renderer.setPixelRatio(value)

	const w = canvas.clientWidth || canvas.width || 360
	const h = canvas.clientHeight || canvas.height || 360
	// Avoid overriding CSS sizing on DPR changes.
	renderer.setSize(w, h, false)
	if (composer) composer.setSize(w, h)
}

export function setNativeDpr(maxCap: number | null = null) {
	const native = window.devicePixelRatio || 1
	setDpr(maxCap ? Math.min(native, maxCap) : native)
}
