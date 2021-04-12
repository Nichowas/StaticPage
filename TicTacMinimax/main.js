// Game State (the board/grid)
class State {
    constructor(v, ...c) {
        // (9 sized) array (2D space into 1D array)
        this.v = v
        //just paramater handling
        if (typeof c[0] == 'boolean' && !this.over())
            this.setDTT(c[0]) // set the children as variations of self (and its children etc.)
        else
            this.c = c
    }
    //set (down the) tree
    setDTT(turn) {
        this.c = []
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (this.v[x + 3 * y] == 0) { // if cell is available
                    let copy = [...this.v] // copy...
                    copy[x + 3 * y] = turn + 1 // ...and alter state
                    this.c.push(new State(copy, !turn)) // add as child
                }
            }
        }
    }
    // way of defining worth of finsihed games (root states) or checking for wins (1 for P2, -1 for P1, 0 for no win)
    worth() {
        for (let i = 0; i < 3; i++) { // only three horizontal wins and 3 vertical wins (does them in same loop)
            let ti = 3 * i // threei
            if (this.v[ti] == this.v[ti + 1] && this.v[ti] == this.v[ti + 2] && this.v[ti]) //Horizontal
                return this.v[ti] == 2 ? 1 : -1
            if (this.v[i] == this.v[i + 3] && this.v[i] == this.v[i + 6] && this.v[i]) // Vertical
                return this.v[i] == 2 ? 1 : -1
        }
        // Diagonal
        if (this.v[0] == this.v[4] && this.v[0] == this.v[8] && this.v[0])
            return this.v[0] == 2 ? 1 : -1
        if (this.v[2] == this.v[4] && this.v[2] == this.v[6] && this.v[2])
            return this.v[2] == 2 ? 1 : -1
        return 0
    }
    // whether game is over (w/o ties because minimax handles that)
    over() {
        return (this.worth() != 0)
    }
    // used for debuggin creates 3x3 string of game
    string() {
        let V = this.v.map(v => ' XO'[v])
        return V[0] + V[1] + V[2] + '\n' + V[3] + V[4] + V[5] + '\n' + V[6] + V[7] + V[8] + '\n'
    }
}
// Main AI, uses ideas learnt in https://www.youtube.com/watch?v=l-hh51ncgDI (Minimax Video by Sebastian Lague)
function minimax(n, turn) {
    // handles root nodes (win or tie)
    if (n.c.length == 0 || n.over()) {
        return [n.worth()]
    }

    // flip is for flipping > to < easily, bV is for the best/worst search, bVV = best/worst childs worth
    // Factor is used for punishing longer routes to the same success (unecessary moves)
    // by multiplying a worth by the total product of depth of other worths
    // <=> multiplying a worth by the total product of depth of all worths / own depth
    let flip = turn * 2 - 1, bV, worths = [], bVV, factor = 1
    for (let i = 0; i < n.c.length; i++) { // Makes worths array & gathers factor
        let worth = minimax(n.c[i], !turn) // calculate worth / recursive call
        worths.push(worth) // add worth
        factor *= worth.length // calculate total product of depth
    }
    for (let i = 0; i < worths.length; i++) { // find best worth (first of the best in this loop)
        let len = worths[i].length - 1
        let fac = factor / worths[i].length // this worths own depth * total product
        worths[i][len] = worths[i][len] * fac // punish longer routes

        // multiplying both comparisees by flip utilises the sneaky fact that -a > -b <=> a < b and so flips > to <
        if (i == 0 || flip * worths[i][len] > flip * bV[bV.length - 1]) { // first in list or is better
            bV = [i, ...worths[i]] // is best so far 
            // IMPORTANT: worth / output of recursive includes the direction down the tree it went (so far): 
            // [firstDec, secondDec, thirdDec, ..., value]
            bVV = worths[i][len] // is best value of worth so far (value)
        }
    }
    let possible = []
    for (let i = 0; i < worths.length; i++)  // Find all worths that are of equivalent value to the first best (all bests)
        if (worths[i][worths[i].length - 1] == bVV) possible.push([i, ...worths[i]])
    let out = possible[Math.floor(Math.random() * possible.length)] // choose random of best move
    oV = out[out.length - 1]
    oV /= out.length // normalise to be repunished (remultiplied) for longer routes in other instances of recursive
    out[out.length - 1] = oV
    return out // return random best worth
}
// start game state (empty)
let game = new State(
    [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ], true // P2 move (yours)
)
var canvas = document.getElementById('canvas'), w = 300, h = 300, context = canvas.getContext('2d') // canvas, context, dimensions

// On click
canvas.addEventListener('mousedown', function (e) {
    if (game.over()) return // cant play once game is over
    const rect = canvas.getBoundingClientRect() // for calulating click pos
    let x = e.clientX - rect.left,
        y = e.clientY - rect.top // calculates click pos in canvas space
    x = Math.floor(3 * x / rect.width)
    y = Math.floor(3 * y / rect.height) // click pos in game space
    let copy = [...game.v]
    copy[x + y * 3] = 2 // alter
    let newi = game.c.findIndex(c => !c.v.some((v, i) => v != copy[i])) // find what child represent the move
    if (newi != -1) makeTurn(newi) // make move
})

// Render function
function render() {
    // Background
    context.fillStyle = '#000000'
    context.fillRect(0, 0, w, h)

    // Draw Game
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let i = x + y * 3 // index in game value array
            let W = w / 3, H = h / 3 // Cell Size

            // Background w/o edges
            context.fillStyle = '#ffffff'
            context.fillRect(x * W + 5, y * H + 5, W - 10, H - 10)

            context.strokeStyle = '#000000'; context.lineWidth = 5 // set up strokes (lines/arcs) 
            if (game.v[i] != 0) { // not empty cell
                context.beginPath()
                if (game.v[i] == 1) { // (X) Cross for P1
                    context.moveTo(x * W + 10, y * W + 10)
                    context.lineTo((x + 1) * W - 10, (y + 1) * H - 10)
                    context.moveTo((x + 1) * W - 10, y * W + 10)
                    context.lineTo(x * W + 10, (y + 1) * H - 10)

                } else { // (O) Circle for P2
                    context.arc((x + 0.5) * W, (y + 0.5) * H, W / 2 - 20, 0, 2 * Math.PI)
                }
                context.stroke()
            }
        }
    }
}

// end game check > end game
function gameOver() {
    if (game.over()) {
        // start and end of win line
        let start, end


        // Re check wins but with start and end found
        for (let i = 0; i < 3; i++) {
            let ti = 3 * i
            if (game.v[ti] == game.v[ti + 1] && game.v[ti] == game.v[ti + 2] && game.v[ti]) {
                start = ti, end = ti + 2
                break;
            }
            if (game.v[i] == game.v[i + 3] && game.v[i] == game.v[i + 6] && game.v[i]) {
                start = i, end = i + 6
                break;
            }
        }
        if (game.v[0] == game.v[4] && game.v[0] == game.v[8] && game.v[0]) {
            start = 0, end = 8
        } else if (game.v[2] == game.v[4] && game.v[2] == game.v[6] && game.v[2]) {
            start = 2, end = 6
        }

        // extract x, y from i
        let [sx, sy] = [start % 3 + 0.5, Math.floor(start / 3) + 0.5]
        let [ex, ey] = [end % 3 + 0.5, Math.floor(end / 3) + 0.5]

        //Make Line bigger
        if (sx == ex) { // Vertical
            sy -= 0.25
            ey += 0.25
        } else if (sy == ey) { // Horizontal
            sx -= 0.25
            ex += 0.25
        } else { // Diagonal
            let flip = sx > ex ? -1 : 1
            sx -= flip * 0.25
            sy -= 0.25
            ex += flip * 0.25
            ey += 0.25
        }
        // Scale into canvas space
        sx *= w / 3
        ex *= w / 3
        sy *= h / 3
        ey *= h / 3

        // Draw win line
        context.strokeStyle = '#000000'
        context.lineWidth = 10
        context.beginPath()
        context.moveTo(sx, sy)
        context.lineTo(ex, ey)
        context.stroke()
    }
}
// makes both player move and AI move
function makeTurn(move) {
    // Player move
    game = game.c[move] // get child
    if (game.c.length == 0 || game.over()) { // if it means game is won (probably unecessary)
        render()
        gameOver()
        return
    }
    // AI move (immediately after)
    let dec = minimax(game, false)
    if (dec[dec.length - 1] == 1) console.log(':(') // lol for if it can be beat and it knows it
    game = game.c[dec[0]]
    if (game.c.length == 0 || game.over()) { // if it means game is won
        render()
        gameOver()
        return
    }
    render()
}

render() 