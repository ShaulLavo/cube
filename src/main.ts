import './style.css'
import * as THREE from 'three'
const container = document.querySelector('#app')!

const scene = new THREE.Scene()

scene.background = new THREE.Color('skyblue')

const fov = 35
const aspect = container.clientWidth / container.clientHeight
const near = 0.1
const far = 100

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

camera.position.set(0, 0, 10)
const light = new THREE.DirectionalLight('white', 8)
light.position.set(10, 10, 10)

const geometry = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshStandardMaterial({ color: 'purple' })
const cube = new THREE.Mesh(geometry, material)
cube.rotation.set(-0.5, -0.1, 0.8)

const radiansPerSecond = THREE.MathUtils.degToRad(30)

const clock = new THREE.Clock()

const animate = () => {
	const delta = clock.getDelta()

	// increase the cube's rotation each frame
	cube.rotation.z += radiansPerSecond * delta
	cube.rotation.x += radiansPerSecond * delta
	cube.rotation.y += radiansPerSecond * delta

	renderer.render(scene, camera)
	requestAnimationFrame(animate)
}

scene.add(cube, light, new THREE.AmbientLight('white', 0.5))

const renderer = new THREE.WebGLRenderer()
renderer.setSize(container.clientWidth, container.clientHeight)

renderer.setPixelRatio(window.devicePixelRatio)

container.append(renderer.domElement)

renderer.render(scene, camera)
animate()
