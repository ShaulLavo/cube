import { dispose, load } from './src'

const loader = /* html */ `
<svg width="60" height="60" viewBox="0 0 50 50">
    <rect x="15" y="15" width="20" height="20" fill="#60A5FA" transform="rotate(45 25 25)">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25"
            dur="2s" repeatCount="indefinite"></animateTransform>
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"></animate>
    </rect>
</svg>
`

const size = Math.min(window.innerWidth, window.innerHeight) * 0.66
const app = document.querySelector('#app') as HTMLDivElement
const loaderElement = document.createElement('div')
loaderElement.innerHTML = loader
app.appendChild(loaderElement)
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
load({ canvas, bloom: false }).then(() => {
	setTimeout(() => {
		loaderElement.remove()
	}, 0)
})

// dispose()
// load({ canvas })
