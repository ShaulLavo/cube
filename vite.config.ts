import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          three_examples: [
            'three/examples/jsm/controls/OrbitControls.js',
            'three/examples/jsm/environments/RoomEnvironment.js',
            'three/examples/jsm/loaders/EXRLoader.js',
            'three/examples/jsm/geometries/RoundedBoxGeometry.js'
          ],
          postprocessing: ['postprocessing'],
          solver: ['cubejs', 'comlink']
        }
      }
    }
  }
})

