var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d") // Canvas & Canvas > Context
let w = 800, h = 800, res = 10 // Dimensions

var grid
// Start: Are you making your first move. Over: whether game is over / active. Win: once game is over, did you win?.
var over, start, win, bombsTotal = Math.floor(res ** 2 / 8), bombsDefused = 0

function init(bc) {
	// n: bomb count (n/a for bombs). b: is it a bomb?. v: visible. flag: has it been flagged (n/a if visible).
	// (res x res) sized array (2D grid in 1D array)
	grid = Array.from(Array(res ** 2), () => ({ n: 0, b: false, v: false, flag: false })) // Define & Init Grid
	over = false; start = true; win = false; // not over, starting, not won

	// Make Bombs and calculate bomb count for each cell
	for (let i = 0; i < bc; i++) {
		// Calculate random place to put bomb
		let brand = () => {
			let r = Math.floor(Math.random() * grid.length)
			if (grid[r].b)
				return brand()
			return r
		}
		let r = brand()

		// Set as a bomb
		grid[r].b = true

		// Define whether neighbours exist (OOB condition)
		let L = r % res != 0, R = r % res != (res - 1),
			U = r >= res, D = r < res * (res - 1)

		// Up neighbours bomb count
		if (L) grid[r - 1].n++
		if (R) grid[r + 1].n++
		if (U) grid[r - res].n++
		if (D) grid[r + res].n++
		if (L && U) grid[r - 1 - res].n++
		if (L && D) grid[r - 1 + res].n++
		if (R && U) grid[r + 1 - res].n++
		if (R && D) grid[r + 1 + res].n++
	}
}
// For debugging. Makes a string (res x res) displaying grid
function gridString() {
	let out = ''
	for (let y = 0; y < res; y++) {
		for (let x = 0; x < res; x++) {
			let c = grid[x + y * res]
			out += c.b ? 'X' : (c.n == 0 ? ' ' : c.n.toString())
		}
		out += '\n'
	}
	return out
}

// Render function
function render() {
	// Background
	context.fillStyle = '#000000'
	context.fillRect(0, 0, w, h)

	let W = w / res, H = h / res // Cell size
	for (let y = 0; y < res; y++) {
		for (let x = 0; x < res; x++) {
			let g = grid[x + y * res] // Current cell
			context.fillStyle = g.v ? '#f0f0f0' : '#d0d0d0' // Visible: light, else: darker
			context.fillRect(x * W + 1, y * H + 1, W - 2, H - 2) // Draw Cell background (w/o edges)
			if (g.v || over) { // over reveals all cells
				if (g.b) {
					// Bombs have a circle (green when won, else red)
					context.fillStyle = win ? '#00ff00' : '#ff0000'
					context.beginPath()
					context.arc((x + 0.5) * W, (y + 0.5) * H, W / 2 - 20, 0, 2 * Math.PI)
					context.fill()
				} else if (g.n != 0) {
					// visible cell, has nearby bombs
					context.fillStyle = "#000000";
					context.font = `bold ${Math.floor(W / 2)}px Arial`;
					context.fillText(g.n.toString(), x * W + W / 2, y * H + H / 2);
				}
			} else if (g.flag) {
				// Flag => smaller red square
				context.fillStyle = '#ff0000'
				context.fillRect((x + 0.3) * W, (y + 0.3) * H, W * 0.4, H * 0.4)
			}
		}
	}
}

// Uses flood fill (stack/LILO) to reveal invisible squares w/ render
function reveal(I) {
	let stack = [I] // Starts with I
	let total = 0 // Counts total squares revealed
	while (stack.length != 0) {
		total++
		let i = stack.pop() // Get last cell in stack (& removes it too as a bonus)
		grid[i].v = true // Reveal
		delete grid[i].flag // Flag n/a
		if (grid[i].n == 0) { // Ensures cells with nearby cells can be added to stack but cannot add others
			let cond = (c, i) => !c.b && !c.v && !stack.find(s => s == i) // Shortens code, tests if cell should be added to stack

			// Define whether neighbours exist (OOB condition)
			let L = i % res != 0, R = i % res != (res - 1),
				U = i >= res, D = i < res * (res - 1)

			// if not OOB & passes cond add to stack
			if (L && cond(grid[i - 1], i - 1)) stack.push(i - 1) //L
			if (R && cond(grid[i + 1], i + 1)) stack.push(i + 1) //R
			if (U && cond(grid[i - res], i - res)) stack.push(i - res) //U
			if (D && cond(grid[i + res], i + res)) stack.push(i + res) //D
			// Diagonals too!
			if (L && U && cond(grid[i - 1 - res], i - 1 - res)) stack.push(i - 1 - res) //LU
			if (L && D && cond(grid[i - 1 + res], i - 1 + res)) stack.push(i - 1 + res) //LD
			if (R && U && cond(grid[i + 1 - res], i + 1 - res)) stack.push(i + 1 - res) //RU
			if (R && D && cond(grid[i + 1 + res], i + 1 + res)) stack.push(i + 1 + res) //RD
		}
	}
	// render and return total revealed cells
	render()
	return total
}

// On Click (big function soz, it handles a lot of game logic) w/ render
document.addEventListener('mousedown', e => {
	if (over) return // cannot play if over
	let bu = [false, undefined, true][e.button] // button (true for right click, false for left, n/a for middle)
	e.preventDefault() // not sure if necessary or does anything (canvas has a property to disable right click menu)
	let rect = canvas.getBoundingClientRect() // for calculating click in canvas space
	let x = e.clientX - rect.left,
		y = e.clientY - rect.top // calc click pos in canvas space
	x = Math.floor(res * x / rect.width)
	y = Math.floor(res * y / rect.height) // convert to grid space
	let c = grid[x + y * res] // clicked cell
	if (!c.v) {
		if (bu) {
			if (c.flag) { //right click
				// remove flag
				if (c.b)
					bombsDefused--
				grid[x + y * res].flag = false
			} else {
				// add flag (properly defused too)
				if (c.b)
					bombsDefused++
				grid[x + y * res].flag = true

				// if removed all bombs
				if (bombsDefused == bombsTotal) {
					setTimeout(() => {
						win = true; over = true // end game
						for (let i = 0; i < grid.length; i++) grid[i].v = true // reveal all cells
						render() // render
					}, 500) // 500ms wait to make it feel better
				}
			}
		} else { // left click
			if (start) {
				// Ensure grid is suitable for first move (no bombs, plenty of room)
				let co = reveal(x + y * res) // reveal
				let grand = () => {
					init(bombsTotal);
					if (grid[x + y * res].b) return grand() // no bombs
					let re = reveal(x + y * res) // reveal
					if (re < 20) return grand() // plenty of room
					return re
				}
				if (co < 20 || c.b) grand() // only call if it needs to be
				start = false // first move made
			} else {
				if (c.b) { // hit a bomb
					grid[x + y * res].v = true // reveal bomb
					setTimeout(() => {
						win = false; over = true // end game
						for (let i = 0; i < grid.length; i++)grid[i].v = true // reveal all cells
						render() // render
					}, 500) // 500ms wait to make it feel better
				} else {
					reveal(x + y * res) // simple
				}
			}
		}
	}
	render() // render
})

// Init game
init(bombsTotal)
render()


