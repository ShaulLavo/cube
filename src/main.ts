import './style.css'
import { camera, controls, onResize, renderer, scene } from './threeSetup'
import { cubeGroup, buildCube } from './cube/cube'
import { hasPendingTurns, isTurnInProgress, startNextTurn, turnFace, updateTurn } from './cube/turning'
import * as THREE from 'three'
import { mountKeymap } from './ui/keymap'

// Add cube to the scene
scene.add(cubeGroup)
buildCube()

// Keyboard controls: U D L R F B (lowercase = counterclockwise)
window.addEventListener('keydown', e => {
  if (isTurnInProgress()) return // prevent stacking interactive input mid-turn
  const k = e.key
  const face = k.toUpperCase()
  const isFace = ['U', 'D', 'L', 'R', 'F', 'B'].includes(face)
  if (!isFace) return
  const ccw = k !== face // lowercase => counterclockwise
  turnFace(face as any, ccw)
})

// Resize handling
window.addEventListener('resize', onResize)

// Animation loop
const clock = new THREE.Clock()
function animate() {
  const delta = clock.getDelta()
  controls.update()
  if (!isTurnInProgress() && hasPendingTurns()) startNextTurn()
  updateTurn(delta)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

renderer.render(scene, camera)
animate()

// Mount key map overlay
mountKeymap()
