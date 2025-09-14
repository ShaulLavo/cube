import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const container = document.querySelector('#app') as HTMLDivElement

export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x222831)

const fov = 40
const aspect = container.clientWidth / container.clientHeight
const near = 0.1
const far = 100
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(6, 6, 10)

// Lights
const dirLight = new THREE.DirectionalLight('white', 6)
dirLight.position.set(10, 12, 8)
scene.add(new THREE.AmbientLight('white', 0.6))
scene.add(dirLight)

export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(window.devicePixelRatio)
container.append(renderer.domElement)

export const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enablePan = false
controls.minDistance = 6
controls.maxDistance = 20

export function onResize() {
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

