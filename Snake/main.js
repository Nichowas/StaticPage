var canvas = document.getElementById('canvas'),
    context = canvas.getContext("2d"),
    scoreDiv = document.getElementById("score") // Document Elements
var w = 800, h = 800, res = 10, score, wait = 1000 // Dimensions + other
var snake = [[Math.floor(res / 2), Math.floor(res / 2)]], apple // Objects (Snake, Apple)
var dir = [1, 0], ldir = dir, keyToDir = { U: [0, -1], D: [0, 1], R: [1, 0], L: [-1, 0] } // Direction

// Key Event
document.addEventListener('keydown', (e) => {
    if (e.key.slice(0, 5) == 'Arrow') {
        turn(keyToDir[e.key[5]])
    }
})
// Swipe functionality for mobile users
document.addEventListener('swiped-left', (e) => turn([-1, 0]))
document.addEventListener('swiped-right', (e) => turn([1, 0]))
document.addEventListener('swiped-up', (e) => turn([0, -1]))
document.addEventListener('swiped-down', (e) => turn([0, 1]))

// Test if snake is at (x, y)
function partAt([x, y]) {
    return snake.findIndex(p => p[0] == x && p[1] == y)
}
// Randomise Apple Location
function randomApple() {
    apple = [Math.floor(Math.random() * res), Math.floor(Math.random() * res)]
    if (partAt(apple) != -1) randomApple()
}
// Turns Snake w/ render
function turn(d) {
    if (d[0] == -ldir[0] && d[1] == -ldir[1] && snake.length != 1) return
    dir = d
    render(context)
}

// Update function - handles game logic w/ render
function update() {
    // To-be head
    let [x, y] = [snake[0][0] + dir[0], snake[0][1] + dir[1]]

    // Check for edge-collision
    if (x < 0 || x >= res || y < 0 || y >= res) return
    // Check for self-collision
    let pa = partAt([x, y]); if (pa != -1 && pa != snake.length - 1) return

    // Check for apple-collision
    if (x == apple[0] && y == apple[1]) {
        score += 200
        randomApple()
        if (wait != 200)
            wait -= 200
    } else
        snake.pop()
    // Add in head
    snake.unshift([x, y])

    // Update ldir
    ldir = dir
    // render call & continue update call
    render(context)
    setTimeout(update, wait)
}

// Render function - Snake
function render(ctx) {
    let W = w / res, H = h / res // Cell size

    // Background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, w, h)

    // Snake
    ctx.strokeStyle = '#000000'
    let BRI = 1
    // All Snake Parts drawn
    for (let i = 0; i < snake.length; i++) {
        let [x, y] = snake[i] // Current snake part
        let X = x * W, Y = y * H // Canvas position

        // Handle Colouring
        ctx.fillStyle = `#00${i == 0 ? 'ff' : Math.floor(BRI * 256).toString(16)}00` // Convert (1-0) float to (00-ff) string (hex)
        BRI -= 1 / snake.length / 2

        ctx.fillRect(X, Y, W, H) // Draw Snake Part

        // Outline (for near but not joined parts)
        let closeTo = (i1, i2) => i2 != -1 && (i2 == i1 + 1 || i2 == i1 - 1) // if snake is joined (assumed near)
        ctx.beginPath();
        if (!closeTo(i, partAt([x + 1, y]))) { ctx.moveTo(X + W, Y); ctx.lineTo(X + W, Y + H) } // R
        if (!closeTo(i, partAt([x - 1, y]))) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + H) }         // L
        if (!closeTo(i, partAt([x, y - 1]))) { ctx.moveTo(X, Y); ctx.lineTo(X + W, Y) }         // U
        if (!closeTo(i, partAt([x, y + 1]))) { ctx.moveTo(X, Y + H); ctx.lineTo(X + W, Y + H) } // D
        ctx.stroke();
    }
	
    ctx.fillStyle = '#ff0000'

    // Snake Tongue
    let tw = 0.1, tl = 0.4 // tongue width and length (l > w)
    if (dir[0] == 0)
        ctx.fillRect(W * (snake[0][0] + (1 - tw) / 2), H * (snake[0][1] + ((dir[1] == 1) ? 1 : -tl)), W * tw, H * tl) // Vertical-Tongue
    else
        ctx.fillRect(W * (snake[0][0] + ((dir[0] == 1) ? 1 : -tl)), H * (snake[0][1] + (1 - tw) / 2), W * tl, H * tw) // Horizontal-Tongue

    // Apple
    ctx.fillRect(W * apple[0], H * apple[1], W, H)

    // Set ScoreDiv
    scoreDiv.innerHTML = `Score: ${score}`
}

// Initialise Game
score = 0
randomApple()
update()