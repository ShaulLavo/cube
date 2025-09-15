export function mountKeymap() {
	const el = document.createElement('div')
	el.className = 'keymap-overlay'
	el.innerHTML = `
    <div class="keymap-title">Key Map</div>
    <div class="keymap-rows">
      <div><code>U</code> / <code>D</code> — Up / Down</div>
      <div><code>L</code> / <code>R</code> — Left / Right</div>
      <div><code>F</code> / <code>B</code> — Front / Back</div>
      <div class="keymap-hint"><code>lowercase</code> = counterclockwise</div>
      <div><code>S</code> — Scramble (animated)</div>
      <div><code>P</code> — Solve (animated)</div>
      <div><code>A</code> — Toggle auto loop (scramble → solve → repeat)</div>
    </div>
  `
	document.body.appendChild(el)
}
