import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

export const container = document.querySelector('#app') as HTMLDivElement

export const scene = new THREE.Scene()
// Transparent canvas background (keep environment for reflections)
scene.background = null

const fov = 40
const aspect = container.clientWidth / container.clientHeight
const near = 0.1
const far = 100
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(10, -6, -11)

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.8
renderer.setClearColor(0x000000, 0)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
container.append(renderer.domElement)

const pmrem = new THREE.PMREMGenerator(renderer)

let envRT: THREE.WebGLRenderTarget | null = null
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

async function setEnvFromEXR(url: string) {
	try {
		const loader = new EXRLoader()
		const exr = await loader.loadAsync(url)
		if (envRT) envRT.dispose()
		envRT = pmrem.fromEquirectangular(exr as any)
		scene.environment = envRT.texture
	} catch (e) {
		console.warn('EXR env load failed:', e)
	}
}
setEnvFromEXR('/Spruit Sunrise 4K.exr')

export const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enablePan = false
controls.minDistance = 6
controls.maxDistance = 20
controls.target.set(0, 0, 0)
controls.update()
controls.saveState()

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.ShadowMaterial({ opacity: 0.25 })
)
ground.rotation.x = -Math.PI / 2
ground.position.y = -2
ground.receiveShadow = true
scene.add(ground)

export const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
export const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(container.clientWidth, container.clientHeight),
	0.1,
	0.8,
	0.92
)
composer.addPass(renderPass)
composer.addPass(bloomPass)

export function onResize() {
	const w = container.clientWidth
	const h = container.clientHeight
	camera.aspect = w / h
	camera.updateProjectionMatrix()
	renderer.setSize(w, h)
	composer.setSize(w, h)
}

export function renderScene() {
	composer.render()
}
