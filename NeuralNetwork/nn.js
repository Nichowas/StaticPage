// No. Just No.
// Im not even going to comment this one, idc

var xorfunc = (x, y) => [x + y - 2 * x * y]
var examples = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [0.5, 0.5]
]

class AI {
    constructor(lr, test, ...shape) {
        this.learnRate = lr
        this.test = test
        this.shape = shape
        this.initialise(2)
    }
    initialise(range) {
        this.W = []
        for (let l = 0; l < this.shape.length - 1; l++) {
            let layer = []
            for (let rn = 0; rn < this.shape[l + 1]; rn++) {
                let rnw = []
                for (let ln = 0; ln < this.shape[l]; ln++) {
                    rnw.push(range * (2 * Math.random() - 1))
                }
                layer.push(rnw)
            }
            this.W.push(layer)
        }
        this.B = Array.from(this.shape, layer =>
            Array.from({ length: layer }, _ => [range * (2 * Math.random() - 1)])
        )
    }
    feed(entry) {
        let A = [entry]
        for (let i = 0; i < this.shape.length - 1; i++) {
            A.push(
                this.activate(
                    Array.linear(
                        this.W[i],
                        A[i],
                        this.B[i + 1]
                    )
                )
            )
        }
        return A
    }
    train(example) {
        let X = this.feed(example.map(_ => [_])), target = [this.test(...example)]
        let le = target.sub(X[X.length - 1]), error = [le]
        for (let i = this.shape.length - 2; i >= 0; i--) {
            let delta = error[0], en = this.W[i].transpose().mult(delta)
            error.unshift(en)
            let S = this.dActivate(
                Array.linear(
                    this.W[i],
                    X[i],
                    this.B[i + 1]
                )
            ).scale(delta).map(_ => _.map(x => x * this.learnRate))
            let D = S.mult(X[i].transpose())
            this.W[i] = D.add(this.W[i])
            this.B[i + 1] = S.add(this.B[i + 1])
        }
    }
    activate(X) {
        return X.map(_ => _.map(x =>
            AI.sigmoid(x)
        ))
    }
    dActivate(X) {
        return X.map(_ => _.map(x =>
            AI.derivative(
                AI.sigmoid(x)
            )
        ))
    }
}
AI.sigmoid = x => 1 / (1 + Math.exp(-x))
AI.derivative = y => y * (1 - y)

Array.prototype.add = function (B) {
    return this.map(
        (_, i) => _.map(
            (x, j) => x + B[i][j]
        )
    )
}
Array.prototype.sub = function (B) {
    return this.add(B.scale(-1))
}
Array.prototype.scale = function (B) {
    if (typeof B == 'number')
        return this.map(_ => _.map(x => x * B))
    return this.map(
        (_, i) => _.map(
            (x, j) => x * B[i][j]
        )
    )
}
Array.prototype.mult = function (B) {
    let out = []
    for (let y = 0; y < this.length; y++) {
        let row = []
        for (let x = 0; x < B[0].length; x++) {
            row.push(
                B.reduce(
                    (acc, _, i) => acc + this[y][i] * B[i][x],
                    0
                )
            )
        }
        out.push(row)
    }
    return out
}
Array.prototype.transpose = function () {
    let out = []
    for (let x = 0; x < this[0].length; x++) {
        let row = []
        for (let y = 0; y < this.length; y++) {
            row.push(this[y][x])
        }
        out.push(row)
    }
    return out
}
Array.linear = function (m, x, c) {
    return m.mult(x).add(c)
}

//initialise
var xor = new AI(0.1, xorfunc, 2, 4, 1), canvas = document.getElementById('canvas')
let w = 800, h = 800, res = 10, ctx = canvas.getContext("2d")
let W = w / res, H = h / res

function render() {
    for (let y = 0; y < res; y++) {
        for (let x = 0; x < res; x++) {
            let mx = x / res, my = y / res
            let X = x * W, Y = y * H

            let num = xor.feed([[mx], [my]])
            num = num[num.length - 1][0][0]

            num = Math.floor(num * 256)
            if (num == 256) num = 255
            let col = `#${num.toString(16)}0000`
            ctx.fillStyle = col
            ctx.fillRect(X + 1, Y + 1, W - 2, H - 2)
        }
    }
}

//Train
// 10,000t < 550ms
setInterval(_ => {
    let then = Date.now()
    for (let i = 0; i < 100; i++) {
        // let ri = Math.floor(Math.random() * examples.length)
        // xor.train(examples[ri])
        xor.train([Math.random(), Math.random()])
    }
    render()
}, 50)