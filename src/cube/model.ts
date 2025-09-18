import Cube from 'cubejs'
import { wrap, type Remote } from 'comlink'

type SolverWorkerAPI = {
	init(): void
	scramble(): string
	solve(moves: string, maxDepth?: number): string
}

let solverProxy: Remote<SolverWorkerAPI> | null = null
function ensureWorkerProxy() {
    if (solverProxy) return solverProxy
    const w = new Worker(new URL('./solverWorker.ts', import.meta.url), {
        type: 'module'
    })
    solverProxy = wrap<SolverWorkerAPI>(w)
    return solverProxy
}

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'

let cube = new Cube()
let solverInitialized = false
let movesApplied: string[] = []

export function getCube() {
	return cube
}

export function resetCube() {
	cube = new Cube()
	movesApplied = []
	return cube
}

export function randomizeCube() {
	cube.randomize()
	return cube
}

export function moveFace(face: Face, ccw = false) {
	const alg = ccw ? `${face}'` : face
	cube.move(alg)
	movesApplied.push(alg)
}

export function applyAlgorithm(alg: string) {
	cube.move(alg)
	// Track moves so the worker can reconstruct state
	for (const part of alg.trim().split(/\s+/)) {
		if (!part) continue
		movesApplied.push(part)
	}
}

export function ensureSolver() {
	if (solverInitialized) return
	const proxy = ensureWorkerProxy()
	// Fire-and-forget init; callers don't need to await
	proxy.init()
	solverInitialized = true
}

export async function solutionForCurrent(maxDepth = 22) {
	ensureSolver()
	const moves = movesApplied.join(' ')
	const proxy = ensureWorkerProxy()
	return await proxy.solve(moves, maxDepth)
}

export async function generateSolverScramble() {
	ensureSolver()
	const proxy = ensureWorkerProxy()
	return await proxy.scramble()
}
