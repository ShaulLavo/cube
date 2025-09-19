import { dispose, load } from './src'

const size = Math.min(window.innerWidth, window.innerHeight) * 0.66
const app = document.querySelector('#app') as HTMLDivElement

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
document.body.style.background = 'black'

canvas.style.pointerEvents = 'auto'
load({ canvas, bloom: false })
// dispose()
// load({ canvas })
