import Cube from 'cubejs'
import * as Comlink from 'comlink'

let initialized = false

const api = {
	init() {
		if (!initialized) {
			Cube.initSolver()
			initialized = true
		}
	},
	scramble() {
		if (!initialized) {
			Cube.initSolver()
			initialized = true
		}
		return Cube.scramble()
	},
	solve(moves: string, maxDepth = 22) {
		if (!initialized) {
			Cube.initSolver()
			initialized = true
		}
		const c = new Cube()
		const seq = (moves || '').trim()
		if (seq) c.move(seq)
		return c.solve(maxDepth)
	}
}

Comlink.expose(api)
