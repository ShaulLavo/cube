import { animateAlgorithm } from './alg'
import { generateSolverScramble } from './model'
import { solutionForCurrent } from './model'
import { hasPendingTurns, isTurnInProgress, clearQueued } from './turning'

let running = false
let timer: number | null = null

function waitForIdle(): Promise<void> {
	return new Promise(resolve => {
		const tick = () => {
			// If auto loop was stopped, don't wait further
			if (!running || (!isTurnInProgress() && !hasPendingTurns())) {
				resolve()
			} else {
				requestAnimationFrame(tick)
			}
		}
		tick()
	})
}

async function loopOnce() {
	if (!running) return
    const scramble = await generateSolverScramble()
	animateAlgorithm(scramble)
	await waitForIdle()
	if (!running) return
	// await delay(1000)
	if (!running) return

	// Only compute solution if still running
	if (!running) return
	const solution = await solutionForCurrent()
	if (!running) return
	animateAlgorithm(solution)
	await waitForIdle()

	if (!running) return
	timer = window.setTimeout(() => {
		loopOnce()
	}, 1000)
}

export function startAutoLoop() {
	if (running) return
	running = true
	loopOnce()
}

export function stopAutoLoop() {
  running = false
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
  // Do not abort the current turn to avoid breaking alignment.
  // Just clear any queued auto turns so we stop at the end of the current turn.
  clearQueued('auto')
}

export function isAutoLoopRunning() {
	return running
}
