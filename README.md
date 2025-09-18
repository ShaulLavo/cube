Cube Library

Consume the cube as a reusable module from another project.

Install (local link)

- In your other project `package.json`, add:

  "dependencies": {
    "cube": "file:../cube"  // adjust relative path
  }

- Or use a workspace: make both repos part of a monorepo and add "cube" as a workspace package.

API Usage

import {
  init,
  start,
  getCanvas,
  getThree,
  scramble,
  solve,
  move,
  runAlgorithm,
  setPixelRatio,
  setPixelRatioNative
} from 'cube'

// Option A: Provide your own canvas element
const canvas = document.getElementById('cube') as HTMLCanvasElement
await init({ canvas, bloom: true })
start()

// Option B: Let the library create a canvas and attach it yourself
await init({ bloom: true })
document.getElementById('container')!.appendChild(getCanvas())
start()

// Interact
await scramble({ animate: true })
await solve({ animate: true })
move('R')                // quarter-turn
runAlgorithm("R U R' U'")

Notes

- The viewer loads a default EXR environment automatically.
- The package exports source TypeScript. Use a modern bundler (Vite/Rollup/ESBuild) so workers and TS are compiled in the consuming app.
- Peer deps: three/postprocessing/cubejs/comlink/animejs are regular deps here; your app can rely on them transitively, or install matching versions explicitly if you prefer a single copy.
