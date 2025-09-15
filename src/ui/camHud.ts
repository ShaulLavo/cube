import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type CamHud = {
  update: (camera: THREE.PerspectiveCamera, controls: OrbitControls) => void
}

export function mountCamHUD(): CamHud {
  const el = document.createElement('div')
  el.className = 'cam-overlay'
  el.style.whiteSpace = 'pre'
  el.innerText = 'camera: —\nangles: —\ntarget: —\ndistance: —'
  document.body.appendChild(el)

  const fmt = (n: number) => n.toFixed(2)
  const toDeg = (r: number) => (r * 180 / Math.PI)

  return {
    update(camera, controls) {
      const p = camera.position
      const t = controls.target
      const az = toDeg(controls.getAzimuthalAngle())
      const po = toDeg(controls.getPolarAngle())
      const d = p.distanceTo(t)
      el.innerText = `camera: (${fmt(p.x)}, ${fmt(p.y)}, ${fmt(p.z)})\nangles: az ${fmt(az)}°, pol ${fmt(po)}°\ntarget: (${fmt(t.x)}, ${fmt(t.y)}, ${fmt(t.z)})\ndistance: ${fmt(d)}`
    }
  }
}

