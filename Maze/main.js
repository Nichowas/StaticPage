// Based on https://en.wikipedia.org/wiki/Maze_generation_algorithm > Randomised Depth First Search > Iterative implementation

// Holds cell, handles many things
class Grid {
    constructor(w, h) {
        // Array of Arrays (2D)
        this.cells = []
        // Dimensions
        this.w = w
        this.h = h
    }
    // Makes Grid (Cells atleast)
    init(state) {
        this.cells = Array.from(Array(this.h), () => Array.from(Array(this.w), () => state))
    }
    // R, D, L, U Vectors
    static moveDir = [
        // x, y
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1]
    ]
    // Map for flipping directions
    static flipMap = [2, 3, 0, 1]

    // Should Clarify first:
    /*
        Each Cell is stored as an int (just a Number in js)
        between 0, 31; it is converted to the binary equivalent
        and each bit stores some boolean
        e.g 28 =>
        1       1       0       1       0
        visit,  right,  down,   left,   up    
        <=> | | (visited already)

        I made it this way because why not? 
        It seemed interesting and efficent
        I easily could have used an array of booleans

        Note: It comes out as (5 size) array of integer (0 or 1 really) 
        which are treated as booleans 
    */

    // Int => Boolean[5]
    static cellToState(c) {
        return Array.from(Array(5), (_, i) => {
            let power = 2 ** (4 - i)
            return Math.floor((c % (2 * power)) / power)
        })
    }
    // Boolean[5] => Int
    static stateToCell(s) {
        return s.reduce((a, p, i) => a + p * 2 ** (4 - i), 0)
    }

    // Completley generates Grid (not visual enough)
    fullGenerate(start) {
        this.cells[start[1]][start[0]] = Grid.stateToCell(
            [1, ...Grid.cellToState(this.cells[start[1]][start[0]]).slice(1)]
        ) // Mark start cell as visited
        this.stk = [start] // Add start cell to stack
        while (this.stk.length != 0) {
            this.partialGenerate() // Call partial function
        }
    }
    // Iterates one step in the generation (is visual when used with delay between calls)
    partialGenerate() {
        // Get current (last on stack <=> LILO) cell (& as bonus remove it)
        let [cx, cy] = this.stk.pop()

        // Filter and format available neighbours
        let nbs = Grid.moveDir.map(([nx, ny], i) => ({ nx: nx + cx, ny: ny + cy, i })).filter(({ nx, ny }) => {
            if (nx < 0 || nx >= this.w) return false // No Horizontally OOB (Out of Bounds) cells
            if (ny < 0 || ny >= this.h) return false // No Vertically OOB Cells
            if (Grid.cellToState(this.cells[ny][nx])[0]) return false // No Already Visited Cells
            return true // All other cells are fine
        })
        if (nbs.length == 0) return // No neighbours => do nothing (cell wasted in stack)
        if (nbs.length != 1) this.stk.push([cx, cy]) // Add self back to stack

        let n = nbs[Math.floor(Math.random() * nbs.length)] // Choose random Neighbour
        let { nx, ny, i } = n // Get properties (deformat)

        let cc = this.cells[cy][cx] // Current Cell
        let cs = Grid.cellToState(cc) // Current. State
        let nc = this.cells[ny][nx] // Neigh. Cell
        let ns = Grid.cellToState(nc) // Neigh. State

        // Open Wall between Current & Neigh.
        cs[i + 1] = 0
        ns[Grid.flipMap[i] + 1] = 0

        ns[0] = 1 // Mark neighbour as visited
        this.stk.push([nx, ny]) // Add neighbour to stack

        //Update Cells
        this.cells[ny][nx] = Grid.stateToCell(ns)
        this.cells[cy][cx] = Grid.stateToCell(cs)
    }
    render(c) {
        let ctx = c.getContext("2d"), w = 800, h = 800 // Get context and dimensions (800 x 800px)

        // Background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)

        // Draw Grid
        for (let y in this.cells) {
            for (let x in this.cells[y]) {
                let W = w / this.w, H = h / this.h, // Cell Size
                    X = x * W, Y = y * H // Position in Canvas space

                let [R, D, L, U] = Grid.cellToState(this.cells[y][x]).slice(1) // Get Walls

                // Draw Walls
                ctx.beginPath();
                if (R) { ctx.moveTo(X + W, Y); ctx.lineTo(X + W, Y + H) }
                if (L) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + H) }
                if (U) { ctx.moveTo(X, Y); ctx.lineTo(X + W, Y) }
                if (D) { ctx.moveTo(X, Y + H); ctx.lineTo(X + W, Y + H) }
                ctx.stroke();
            }
        }
    }
}
// Init grid & get canvas
let grid = new Grid(20, 20), canvas = document.getElementById("canvas")
grid.init(15)

let st = [0, 0] // Start Cell
grid.cells[st[1]][st[0]] = Grid.stateToCell([1, ...Grid.cellToState(grid.cells[st[1]][st[0]]).slice(1)]) // Mark start as visited
grid.stk = [st] // Add start to stack

// Calls to partial and render
let interval = setInterval(() => {
    if (grid.stk.length == 0) {
        // Done: Stop calls & render
        grid.render(canvas)
        clearInterval(interval)
    } else {
        // Continue: Partial & render
        grid.partialGenerate()
        grid.render(canvas)
    }
}, 1000 / (grid.w * grid.h)) // approx. 1s wait time for whole grid (+ wasted cells)