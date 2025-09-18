// Lazy-loading example that mounts a centered canvas and
// loads the cube viewer only when it becomes visible.

// Create or use an existing canvas in the page
const size = Math.min(window.innerWidth, window.innerHeight) * 0.66
const app = document.querySelector('#app') as HTMLDivElement
// Center the cube in the middle of the screen
Object.assign(app.style, {
	position: 'fixed',
	inset: '0',
	display: 'grid',
	placeItems: 'center',
	margin: '0',
	padding: '0'
})
const canvas = document.createElement('canvas')
canvas.width = size
canvas.height = size

Object.assign(canvas.style, {
	width: `${size}px`,
	height: `${size}px`,
	display: 'block',
	background: 'transparent'
})
app.appendChild(canvas)
document.body.style.margin = '0'
document.body.style.background = 'transparent'

const loadCube = async () => {
	const { init, start, autoLoopStart, setZoom } = await import('./src')
	await init(canvas)
	setZoom(false)
	start()
	autoLoopStart()
}

// Idle prefetch of the heavy module to reduce perceived delay
// Ensure pointer events are routed to the canvas (hover/drag)
canvas.style.pointerEvents = 'auto'

if ('IntersectionObserver' in window) {
	const io = new IntersectionObserver(entries => {
		for (const e of entries) {
			if (e.isIntersecting) {
				io.disconnect()
				loadCube()
				break
			}
		}
	})
	io.observe(canvas)
} else {
	// Fallback: idle or next tick
	;(window as any).requestIdleCallback
		? (window as any).requestIdleCallback(loadCube)
		: setTimeout(loadCube, 0)
}
