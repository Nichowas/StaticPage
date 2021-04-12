// Keep in mind this was not a recent project; When I made the site, I brought in many past projects, including this

let context = document.getElementById('cnvs').getContext('2d'), // 1st canvas > context
    context2 = document.getElementById('cnvs2').getContext("2d"), // 2nd canvas > context 
    [width, height] = [800, 800] // Dimensions (800 x 800px)

function marchGrid(In) {
    let [w, h] = [In[0].length, In.length]
    let outside = 1
    let sIn = [
        Array.from({ length: w + 2 }, r => outside),
        ...In.map(r => [outside, ...r, outside]),
        Array.from({ length: h + 2 }, r => outside)
    ]
    let sOut = Array.from({ length: h + 3 }, r => Array.from({ length: w + 3 }, v => 0))
    for (let y = 0; y < h + 2; y++) {
        for (let x = 0; x < w + 2; x++) {
            sOut[y][x] += 2 * sIn[y][x]
            sOut[y][x + 1] += 1 * sIn[y][x]
            sOut[y + 1][x] += 4 * sIn[y][x]
            sOut[y + 1][x + 1] += 8 * sIn[y][x]
        }
    }
    let Out = Array.from(sOut)
    Out.shift(); Out.pop()
    Out.forEach(r => [r.shift(), r.pop()])
    return Out
}
function MeshCell(config) {
    let configs = {
        //0 points
        0: [], //0000
        //1 point
        1: [3, 6, 7], //0001
        2: [2, 5, 6], //0010
        4: [1, 4, 5], //0100
        8: [0, 4, 7], //1000
        //2 points (Adjacent)
        3: [2, 3, 7, 5], //0011
        6: [1, 2, 6, 4], //0110
        9: [0, 3, 6, 4], //1001
        12: [0, 1, 5, 7], //1100
        //2 points (Opposite)
        5: [1, 4, 7, 3, 6, 5], //0101
        10: [0, 4, 5, 2, 6, 7], //1010
        //3 points
        7: [1, 2, 3, 7, 4], //0111
        11: [0, 3, 2, 5, 4], //1011
        13: [0, 1, 5, 6, 3], //1101
        14: [0, 1, 2, 6, 7], //1110
        //4 points
        15: [0, 1, 2, 3] //1111
    }
    return configs[Math.floor(config)]
}

// Render normal Grid => canvas 1
function displayGrid(In) {
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, width, height);
    let [w, h] = [In[0].length, In.length]
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let hex = Math.floor((1 - In[y][x]) * 255).toString(16)
            if (hex.length == 1) hex = "0" + hex
            context.fillStyle = '#' + hex + hex + hex
            context.fillRect(x * width / w, y * height / h, width / w, height / h)
        }
    }
}
// Render Marched Grid
async function displayMarchedGrid(In) {
    // Background
    context2.fillStyle = '#ffffff'
    context2.fillRect(0, 0, width, height);

    // Dimension of Grid
    let [w, h] = [In[0].length, In.length]
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            // Calculate (& Collect) all major points (Corners & (mid-way through) Edges)
            let points = [
                [x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1],
                [x + 0.5, y], [x + 1, y + 0.5], [x + 0.5, y + 1], [x, y + 0.5]
            ]
            let triangles = MeshCell(In[y][x]).map(p => points[p]) // Get Mesh for current cell and convert into grid position

            context2.fillStyle = '#000000'
            let t = triangles.map(p => [p[0] * width / w, p[1] * height / h]) // Map mesh into canvas space
            if (t.length != 0) {
                // Trace out mesh
                context2.beginPath()
                context2.moveTo(...t[0])
                for (let i = 1; i < t.length; i++) context2.lineTo(...t[i])
                context2.fill()
            }
            await new Promise((res) => setTimeout(res, 5)) // Wait 5ms (for visual aesthetic
            // I guess I used to use promises for that
        }
    }
}
// Init grid
let grid = Array.from({ length: 20 }, (_, y) => Array.from({ length: 20 }, (_, x) => Math.random() >= 0.7 ? 1 : 0))
// Render calls
displayGrid(grid)
displayMarchedGrid(marchGrid(grid))
