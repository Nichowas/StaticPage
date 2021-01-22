//CUBE
var cnot = [
    'LDB',
    'LDF',
    'LUB',
    'LUF',
    'RDB',
    'RDF',
    'RUB',
    'RUF'
]
var enot = [
    //X par
    'FD',
    'FU',
    'BD',
    'BU',

    //Y par
    'LF',
    'RF',
    'LB',
    'RB',

    //Z par
    'UL',
    'UR',
    'DL',
    'DR',
]

class Cube {
    constructor() {
        this.c = Array.from([, , , , , , , ,], (_, i) => cnot[i] + cnot[i])
        this.e = Array.from([, , , , , , , , , , , ,], (_, i) => enot[i] + enot[i])
        this.m = ['L', 'R', 'F', 'B', 'U', 'D']
        this.mesh = []
    }
    // fromFace(fixed, up) {
    //     let layer = Cube.key.index[fixed]
    //     let tc = this.c.filter(C => C[layer[0]] == fixed)
    //     let te = this.e.filter(C => C[0] == fixed || C[1] == fixed)
    //     let out = []
    //     for (let y = 0; y < 3; y++) {
    //         let row = []
    //         for (let x = 0; x < 3; x++) {
    //             let res = '=', pos = false
    //             if (x == 1 && y == 1) {
    //                 res = fixed
    //             } else if ((x - 1) * (y - 1) == 0) {
    //                 //Edge
    //                 let otherside = up, angle =
    //                     (x == 1 && y == 0) * 0 +
    //                     (x == 2 && y == 1) * 1 +
    //                     (x == 1 && y == 2) * 2 +
    //                     (x == 0 && y == 1) * 3
    //                 for (let i = 0; i < angle; i++) otherside = Cube.key[fixed][otherside]
    //                 let edge = te.find(C =>
    //                     C.slice(0, 2) == fixed + otherside ||
    //                     C.slice(0, 2) == otherside + fixed)
    //                 if (edge) {
    //                     if (edge[0] == fixed) res = edge[2]
    //                     else res = edge[3]
    //                 }
    //             } else {
    //                 pos = ''
    //                 let types = [
    //                     ['L', 'R'],
    //                     ['U', 'D'],
    //                     ['F', 'B']
    //                 ]
    //                 let swap = fixed == 'L' || fixed == 'R'
    //                 for (let i = 0; i < 3; i++) {
    //                     if (i == layer[0])
    //                         pos += fixed
    //                     if (i == layer[2])
    //                         pos += x == 2 ? types[i][1] : types[i][0]
    //                     if (i == layer[1])
    //                         pos += y == 2 ? types[i][1] : types[i][0]
    //                 }
    //                 let angle = Object.keys(Cube.key[fixed]).findIndex(d => d == up)
    //                 if (swap)
    //                     pos = pos.slice(0, 2) + Cube.key[fixed][Cube.key[fixed][pos[2]]]

    //                 pos += pos
    //                 for (let i = 0; i < angle % 4; i++)
    //                     pos = Cube.crotate(fixed)(pos)
    //                 pos = pos.slice(0, 3)
    //                 //Corner
    //                 let corner = tc.find(C => C.slice(0, 3) == pos)
    //                 if (corner)
    //                     res = corner[Cube.key.index[fixed][0] + 3]
    //                 else
    //                     res = '='
    //             }
    //             row.push(res)
    //         }
    //         out.push(row)
    //     }
    //     return out
    // }
    rotate(dir) {
        this.c = this.c.map(Cube.crotate(dir))
        this.e = this.e.map(Cube.erotate(dir))
    }
    algorithm(str) {
        str = this.format(str)
        for (let i of str) {
            this.rotate(i)
        }
    }
    render() {
        this.mesh = []
        this.pos = [0, 0, 5]
        for (let c of this.c) {
            let add = Cube.cornerToMesh(c)
            for (let t of add) t[4] = this.pos
            this.mesh = [...this.mesh, ...add]
        }
        for (let e of this.e) {
            let add = Cube.edgeToMesh(e)
            for (let t of add) t[4] = this.pos
            this.mesh = [...this.mesh, ...add]
        }
        for (let m of this.m) {
            let add = Cube.centerToMesh(m)
            for (let t of add) t[4] = this.pos
            this.mesh = [...this.mesh, ...add]

        }
        return this.mesh
    }

    static cornerToMesh(c) {
        let x = c[0] == 'R' ? 1.5 : -1.5,
            y = c[1] == 'U' ? 1.5 : -1.5,
            z = c[2] == 'B' ? 1.5 : -1.5

        let ox = 2 * x / 3,
            oy = 2 * y / 3,
            oz = 2 * z / 3
        let
            hor1 = [
                [x, y, z],
                [x, y - oy, z],
                [x, y - oy, z - oz],
                Cube.colours[c[3]], [0, 0, 3.5]],
            hor2 = [
                [x, y, z],
                [x, y, z - oz],
                [x, y - oy, z - oz],
                Cube.colours[c[3]], [0, 0, 3.5]],
            ver1 = [
                [x, y, z],
                [x, y, z - oz],
                [x - ox, y, z - oz],
                Cube.colours[c[4]], [0, 0, 3.5]],
            ver2 = [
                [x, y, z],
                [x - ox, y, z],
                [x - ox, y, z - oz],
                Cube.colours[c[4]], [0, 0, 3.5]],
            lat1 = [
                [x, y, z],
                [x - ox, y, z],
                [x - ox, y - oy, z],
                Cube.colours[c[5]], [0, 0, 3.5]],
            lat2 = [
                [x, y, z],
                [x, y - oy, z],
                [x - ox, y - oy, z],
                Cube.colours[c[5]], [0, 0, 3.5]]
        return [hor1, hor2, ver1, ver2, lat1, lat2]
    }
    static edgeToMesh(e) {
        let x = 0, y = 0, z = 0
        if (e[0] == 'R' || e[1] == 'R')
            x = 1.5
        if (e[0] == 'L' || e[1] == 'L')
            x = -1.5

        if (e[0] == 'U' || e[1] == 'U')
            y = 1.5
        if (e[0] == 'D' || e[1] == 'D')
            y = -1.5

        if (e[0] == 'B' || e[1] == 'B')
            z = 1.5
        if (e[0] == 'F' || e[1] == 'F')
            z = -1.5

        let oa, ob, ca, cb,
            a1, a2, b1, b2
        ca = Cube.colours[e[2]]
        cb = Cube.colours[e[3]]
        if (x == 0) {
            //Y = a
            oa = 2 * y / 3
            a1 = [
                [x + 0.5, y, z],
                [x + 0.5, y - oa, z],
                [x - 0.5, y - oa, z],
                ca, [0, 0, 3.5]]
            a2 = [
                [x + 0.5, y, z],
                [x - 0.5, y, z],
                [x - 0.5, y - oa, z],
                ca, [0, 0, 3.5]]

            //Z = b
            ob = 2 * z / 3
            b1 = [
                [x + 0.5, y, z],
                [x + 0.5, y, z - ob],
                [x - 0.5, y, z - ob],
                cb, [0, 0, 3.5]]
            b2 = [
                [x + 0.5, y, z],
                [x - 0.5, y, z],
                [x - 0.5, y, z - ob],
                cb, [0, 0, 3.5]]

            return [a1, a2, b1, b2]
        }
        if (y == 0) {
            //X = a
            oa = 2 * x / 3
            a1 = [
                [x, y + 0.5, z],
                [x - oa, y + 0.5, z],
                [x - oa, y - 0.5, z],
                cb, [0, 0, 3.5]]
            a2 = [
                [x, y + 0.5, z],
                [x, y - 0.5, z],
                [x - oa, y - 0.5, z],
                cb, [0, 0, 3.5]]

            //Z = b
            ob = 2 * z / 3
            b1 = [
                [x, y + 0.5, z],
                [x, y + 0.5, z - ob],
                [x, y - 0.5, z - ob],
                ca, [0, 0, 3.5]]
            b2 = [
                [x, y + 0.5, z],
                [x, y - 0.5, z],
                [x, y - 0.5, z - ob],
                ca, [0, 0, 3.5]]
            return [a1, a2, b1, b2]
        }
        if (z == 0) {
            //X = a
            oa = 2 * x / 3
            a1 = [
                [x, y, z + 0.5],
                [x - oa, y, z + 0.5],
                [x - oa, y, z - 0.5],
                ca, [0, 0, 3.5]]
            a2 = [
                [x, y, z + 0.5],
                [x, y, z - 0.5],
                [x - oa, y, z - 0.5],
                ca, [0, 0, 3.5]]

            //Y = b
            ob = 2 * y / 3
            b1 = [
                [x, y, z + 0.5],
                [x, y - ob, z + 0.5],
                [x, y - ob, z - 0.5],
                cb, [0, 0, 3.5]]
            b2 = [
                [x, y, z + 0.5],
                [x, y, z - 0.5],
                [x, y - ob, z - 0.5],
                cb, [0, 0, 3.5]]
            return [a1, a2, b1, b2]
        }
    }
    static centerToMesh(m) {
        let x = m == 'L' ? -1.5 : (m == 'R' ? 1.5 : 0),
            y = m == 'D' ? -1.5 : (m == 'U' ? 1.5 : 0),
            z = m == 'F' ? -1.5 : (m == 'B' ? 1.5 : 0),
            c = Cube.colours[m]
        if (Cube.key.index[m][0] == 0) {
            return [
                [
                    [x, y + 0.5, z + 0.5],
                    [x, y + 0.5, z - 0.5],
                    [x, y - 0.5, z - 0.5],
                    c, [0, 0, 3.5]],
                [
                    [x, y + 0.5, z + 0.5],
                    [x, y - 0.5, z + 0.5],
                    [x, y - 0.5, z - 0.5],
                    c, [0, 0, 3.5]]
            ]
        }
        if (Cube.key.index[m][0] == 1) {
            return [
                [
                    [x + 0.5, y, z + 0.5],
                    [x + 0.5, y, z - 0.5],
                    [x - 0.5, y, z - 0.5],
                    c, [0, 0, 3.5]],
                [
                    [x + 0.5, y, z + 0.5],
                    [x - 0.5, y, z + 0.5],
                    [x - 0.5, y, z - 0.5],
                    c, [0, 0, 3.5]]
            ]
        }
        if (Cube.key.index[m][0] == 2) {
            return [
                [
                    [x + 0.5, y + 0.5, z],
                    [x - 0.5, y + 0.5, z],
                    [x - 0.5, y - 0.5, z],
                    c, [0, 0, 3.5]],
                [
                    [x + 0.5, y + 0.5, z],
                    [x + 0.5, y - 0.5, z],
                    [x - 0.5, y - 0.5, z],
                    c, [0, 0, 3.5]]
            ]
        }
        return []
    }


    format(str) {
        let out = ''
        for (let i = 0; i < str.length; i++) {
            let m;
            if (str[i + 1] == '2') {
                m = str[i] + str[i]
                i++
            } else if (str[i + 1] == "'") {
                m = str[i] + str[i] + str[i]
                i++
            }
            else {
                m = str[i]
            }
            out += m
        }
        return out
    }
    // static rotateMoveAroundUpper() {}

    static crotate(dir) {
        return function (p) {
            let pos = p.slice(0, 3).split(''), ori = p.slice(3).split('')
            let layer = Cube.key.index[dir]
            if (pos[layer[0]] == dir) {
                //Swap 2 other in ori
                let t = ori[layer[1]]
                ori[layer[1]] = ori[layer[2]]
                ori[layer[2]] = t
                //Cycle 2 other in pos
                let positivekey = { R: true, U: true, F: true }
                if (positivekey[pos[layer[1]]] == positivekey[pos[layer[2]]]) {
                    //Toggle first other in pos via double turn
                    pos[layer[1]] = Cube.key[dir][Cube.key[dir][pos[layer[1]]]]
                } else {
                    //Toggle second other in pos via double turn
                    pos[layer[2]] = Cube.key[dir][Cube.key[dir][pos[layer[2]]]]
                }
            }
            return pos.join('') + ori.join('')
        }
    }
    static erotate(dir) {
        return function (p) {
            let pos = p.slice(0, 2), ori = p.slice(2)
            if (pos[0] == dir)
                return pos[0] + Cube.key[dir][pos[1]] + ori[1] + ori[0]
            if (pos[1] == dir)
                return Cube.key[dir][pos[0]] + pos[1] + ori[1] + ori[0]
            return p
        }
    }
}
Cube.key = {
    U: {
        L: 'B',
        B: 'R',
        R: 'F',
        F: 'L'
    },
    R: {
        B: 'D',
        D: 'F',
        F: 'U',
        U: 'B',
    },
    F: {
        U: 'R',
        R: 'D',
        D: 'L',
        L: 'U'
    },
    D: {
        F: 'R',
        R: 'B',
        B: 'L',
        L: 'F'
    },
    L: {
        U: 'F',
        F: 'D',
        D: 'B',
        B: 'U',
    },
    B: {
        L: 'D',
        D: 'R',
        R: 'U',
        U: 'L'
    },
    index: {
        L: [0, 1, 2],
        D: [1, 2, 0],
        B: [2, 0, 1],
        R: [0, 2, 1],
        U: [1, 0, 2],
        F: [2, 1, 0]
    }
}
Cube.colours = {
    F: [255, 0, 0],
    R: [0, 255, 0],
    L: [0, 0, 255],
    U: [255, 255, 0],
    B: [255, 128, 0],
    D: [255, 255, 255]
}
let rubiks = new Cube()
{
    // var canvas = document.getElementById('canvas'),
    // context = canvas.getContext('2d')
    // rubiks.algorithm("L'U'LU'RU'R2URLU'L'U'")
    // rubiks.render(context)

    // document.getElementById("nx").onclick = () => {
    //     rubiks.algorithm("x'")
    //     rubiks.render(context)
    // }
    // document.getElementById("x").onclick = () => {
    //     rubiks.algorithm("x")
    //     rubiks.render(context)
    // }
    // document.getElementById("ny").onclick = () => {
    //     rubiks.algorithm("y'")
    //     rubiks.render(context)
    // }
    // document.getElementById("y").onclick = () => {
    //     rubiks.algorithm("y")
    //     rubiks.render(context)
    // }

    // document.getElementById("U").onclick = () => {
    //     rubiks.algorithm("U")
    //     rubiks.render(context)
    // }
    // document.getElementById("nU").onclick = () => {
    //     rubiks.algorithm("U'")
    //     rubiks.render(context)
    // }
    // document.getElementById("D").onclick = () => {
    //     rubiks.algorithm("D")
    //     rubiks.render(context)
    // }
    // document.getElementById("nD").onclick = () => {
    //     rubiks.algorithm("D'")
    //     rubiks.render(context)
    // }
    // document.getElementById("L").onclick = () => {
    //     rubiks.algorithm("L")
    //     rubiks.render(context)
    // }
    // document.getElementById("nL").onclick = () => {
    //     rubiks.algorithm("L'")
    //     rubiks.render(context)
    // }
    // document.getElementById("R").onclick = () => {
    //     rubiks.algorithm("R")
    //     rubiks.render(context)
    // }
    // document.getElementById("nR").onclick = () => {
    //     rubiks.algorithm("R'")
    //     rubiks.render(context)
    // }
}

var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
rubiks.algorithm('U')


//RENDERING
var triangles = rubiks.render(), resolution = 60
{
    function rotationMatrix(y, p, r) {
        let c = Math.cos, s = Math.sin
        return [
            [c(y) * c(p), c(y) * s(p) * s(r) - s(y) * c(r), c(y) * s(p) * c(r) + s(y) * s(r)],
            [s(y) * c(p), s(y) * s(p) * s(r) + c(y) * c(r), s(y) * s(p) * c(r) - c(y) * s(r)],
            [-s(p), c(p) * s(r), c(p) * c(r)]
        ]
    }
    Array.prototype.rotate = function (m) {
        return [
            m[0][0] * this[0] + m[0][1] * this[1] + m[0][2] * this[2],
            m[1][0] * this[0] + m[1][1] * this[1] + m[1][2] * this[2],
            m[2][0] * this[0] + m[2][1] * this[1] + m[2][2] * this[2]
        ]
    }
    Array.prototype.add = function (B) {
        return this.map((e, i) => e + B[i])
    }
}
var rotation = [0, 0, 0]
function renderMesh(w, ctx, tri, res) {
    for (let t of tri) {
        t.rotated = [t[0], t[1], t[2]]
        let rot = rotationMatrix(...rotation), offset = t[4]
        t.rotated = t.rotated.map(p => p.rotate(rot))
        t.rotated = t.rotated.map(p => p.add(offset))
    }
    let workers = []
    let done = 0, img = new Uint8ClampedArray(res * res * 4)
    function drawImage() {
        let imgdata = new ImageData(img, res, res)
        ctx.putImageData(imgdata, 0, 0)
        console.log(Date.now() - d)
    }
    let d = Date.now()
    //1 worker: 5000ms
    //2 worker: 2800ms
    //3 worker: 2200ms
    //4 worker: 2000ms <=
    //5 worker: 2100ms
    //6 worker: 2300ms
    let rowsperworker = 15
    for (let y = 0; y < res; y++) {
        if (y % rowsperworker == 0) {
            workers.push(new Worker('./worker.js'));
            workers[workers.length - 1].addEventListener('error', console.error);
            workers[workers.length - 1].addEventListener('message', e => {
                done++
                for (let x in e.data.img) img[e.data.i * res * 4 + Number(x)] = e.data.img[Number(x)]
                if (done == res / rowsperworker) drawImage()
            })
            workers[workers.length - 1].postMessage({ y, tri, res, fov: 1, rowsperworker })
        }
    }
}
setInterval(() => {
    renderMesh(canvas.clientWidth, context, triangles, resolution)
    rotation[1] += Math.PI / 4
}, 4000)

// _ _ _ _ _ _ _ _ _ _ _ _ _
// N i c k g i t h u b 1 2 3 

