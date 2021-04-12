let bW = 12, bH = 18 // Game dimensions
let concrete = Array.from(Array(bW * bH), (_, i) => (
    i % bW == 0 ||
    (i + 1) % bW == 0 ||
    i >= (bW * (bH - 1))
) ? 1 : 0) // makes the concreted (already placed) grid
let tetri = [
    [ // Line Block
        0, 0, 2, 0,
        0, 0, 2, 0,
        0, 0, 2, 0,
        0, 0, 2, 0
    ],
    [ // T Block
        0, 0, 0, 0,
        0, 0, 3, 0,
        0, 3, 3, 0,
        0, 0, 3, 0,
    ],
    [ // L Block 1
        0, 0, 0, 0,
        0, 4, 4, 0,
        0, 0, 4, 0,
        0, 0, 4, 0,
    ],
    [ // L Block 2
        0, 0, 0, 0,
        0, 5, 5, 0,
        0, 5, 0, 0,
        0, 5, 0, 0,
    ],
    [ // Square Block
        0, 0, 0, 0,
        0, 6, 6, 0,
        0, 6, 6, 0,
        0, 0, 0, 0,
    ],
    [ // Squigly 1
        0, 0, 0, 0,
        0, 0, 7, 0,
        0, 7, 7, 0,
        0, 7, 0, 0,
    ],
    [ // Squigly 2
        0, 0, 0, 0,
        0, 8, 0, 0,
        0, 8, 8, 0,
        0, 0, 8, 0,
    ]
]
//gets cell from (unconcreted) piece with rotations
function piece(t, r, x, y) {
    //different formulas for getting index for different rotations
    switch (r % 4) {
        case 0: return tetri[t][x + 4 * y] // 0
        case 1: return tetri[t][12 + y - 4 * x] // 90
        case 2: return tetri[t][15 - 4 * y - x] // 180
        case 3: return tetri[t][3 - y + 4 * x] // 270
    }
}
// tests for collision between piece and concrete
function collision(t, r, x, y) {
    for (let oy = 0; oy < 4; oy++)
        for (let ox = 0; ox < 4; ox++)
            if (concrete[x + ox + bW * (y + oy) - 2 * (bW + 1)] && piece(t, r, ox, oy)) return 1
    return 0
}


let currentPiece = 0, currentRotation = 0, cx = bW / 2, cy = 2, end = false // end is whether game is over
function changePiece() { // when piece is dropped
    currentPiece = Math.floor(Math.random() * 7) // choose new piece
    cx = bW / 2
    cy = 2
    if (collision(currentPiece, currentRotation, cx, cy)) { // if collision grid is full; game is lost
        end = true
        return
    }
    // check for lines cleared
    for (let y = bH - 2; y >= 0; y--) {
        let row = concrete.slice(bW * y, bW * (y + 1))
        if (!row.some(c => c == 0)) {
            // clear line
            concrete.splice(bW * y, bW) // get rid of cleared line
            concrete = [...Array.from(Array(bW), (_, i) => (i == 0 || i == bW - 1) ? 1 : 0), ...concrete] // add in new space
            y++ // to counteract y-- cus this line need to be checked again cus the other lines fell down to this one
        }
    }
}
// drops piece down by 1
function dropPiece() {
    if (collision(currentPiece, currentRotation, cx, cy + 1)) { // check for collision first
        concrete = concretePiece(currentPiece, currentRotation, cx, cy)
        changePiece()
    } else
        cy++
}
// rotates piece
function rotatePiece(i) {
    if (!collision(currentPiece, currentRotation + i, cx, cy)) // check for collision first
        currentRotation += i
}

// Update function
function update() {
    if (!end) { // cant play if game is over
        dropPiece()
        setTimeout(update, 1000) // continue game loop (1s inbetween)
    }
    render(concretePiece(currentPiece, currentRotation, cx, cy)) // render
}
// moves/rotates piece base on key
function turn(key) {
    switch (key) {
        case 'R':
            if (!collision(currentPiece, currentRotation, cx + 1, cy)) cx++
            render(concretePiece(currentPiece, currentRotation, cx, cy))
            break
        case 'L':
            if (!collision(currentPiece, currentRotation, cx - 1, cy)) cx--
            render(concretePiece(currentPiece, currentRotation, cx, cy))
            break
        case 'D':
            dropPiece()
            render(concretePiece(currentPiece, currentRotation, cx, cy))
            break
        case 'U':
            rotatePiece(1)
            render(concretePiece(currentPiece, currentRotation, cx, cy))

    }
}
// Swipe interactivity for mobile users
document.addEventListener('swiped-left', (e) => turn('L'))
document.addEventListener('swiped-right', (e) => turn('R'))
document.addEventListener('swiped-up', (e) => turn('U'))
document.addEventListener('swiped-down', (e) => turn('D'))
// Key event handling
document.addEventListener('keydown', (e) => {
    if (e.code.slice(0, 5) == 'Arrow') {
        turn(e.code[5])
    }
})
var linesCleared = 0
var canvas = document.getElementById("canvas"), context = canvas.getContext("2d") // canvas, canvas > context
function render(con) {
    if (end) return // cant play if over (update may also do this, but render is called by turns too)
    let W = 800 / bW, H = 1200 / bH, colors = [ // Cell Size and colours
        '#ffffff', '#000000', '#00ffff', '#ff00ff',
        '#ff8000', '#0000ff', '#ffff00', '#ff0000',
        '#00ff00'
    ]
    for (let y = 0; y < bH; y++) {
        for (let x = 0; x < bW; x++) {
            let X = x * W, Y = y * W // pos in canvas space
            context.fillStyle = colors[con[x + bW * y]]
            context.fillRect(X, Y, W, H) // draw rect
        }
    }
}
// Combines piece with already concreted pieces
function concretePiece(t, r, tx, ty) {
    let nConcrete = []
    for (let y = 0; y < bH; y++) {
        for (let x = 0; x < bW; x++) {
            let pieceC = 0
            if (x >= tx - 2 && x < tx + 2 && y >= ty - 2 && y < ty + 2) // if within piceces area (4 x 4)
                pieceC = piece(t, r, x - tx + 2, y - ty + 2) // find what kinda piece ...
            nConcrete.push(pieceC || concrete[x + bW * y]) // ... and combine it
        }
    }
    return nConcrete
}
update()