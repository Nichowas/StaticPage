{
    // Array.prototype.mult = function (B) {
    //     return Array.from(this, (_, n) => Array.from(B[n], (_, i) => this[n].reduce((acc, c, j) => acc + c * B[j][i], 0)))
    // }
    Array.prototype.scale = function (z) {
        return this.map(e => e * z)
    }
    Array.prototype.add = function (B) {
        return this.map((e, i) => e + B[i])
    }
    Array.prototype.sub = function (B) {
        return this.add(B.scale(-1))
    }
    Array.prototype.crossproduct = function (B) {
        return [
            this[1] * B[2] - this[2] * B[1],
            this[2] * B[0] - this[0] * B[2],
            this[0] * B[1] - this[1] * B[0]
        ]
    }
    Array.prototype.dotproduct = function (B) {
        return this[0] * B[0] + this[1] * B[1] + this[2] * B[2]
    }
    Array.prototype.dist = function (B) {
        let dif = this.sub(B)
        return Math.sqrt(dif.dotproduct(dif))
    }
    Array.prototype.norm = function () {
        let d = this.dist(Array.zero)
        return this.scale(1 / d)
    }
    Array.prototype.triNorm = function () {
        let [A, B, C] = this
        return B.sub(A).crossproduct(C.sub(A))
    }
    Array.zero = [0, 0, 0]
    Array.prototype.intersect = function (A, B, C) {
        let [r, d] = this
        let n = [A, B, C].triNorm().norm(),
            nd = n.dotproduct(d)
        if (nd == 0) return

        let t = (n.dotproduct(A) - n.dotproduct(r)) / nd,
            q = r.add(d.scale(t))
        if (t <= 0) return

        let atest = [A, B, q].triNorm().dotproduct(n),
            btest = [B, C, q].triNorm().dotproduct(n),
            ctest = [C, A, q].triNorm().dotproduct(n)
        let tt = 0
        if (atest >= tt && btest >= tt && ctest >= tt) return [q, n]
    }
}
self.onmessage = function (e) {
    let { y, tri, res, fov, rowsperworker } = e.data
    let out = []
    for (let oy = 0; oy < rowsperworker; oy++) {
        for (let x = 0; x < res; x++) {
            let ctri = null, ctrid = Infinity
            let ray = [
                x / res * 2 - 1,
                (y + oy) / res * -2 + 1,
                fov
            ]
            for (let n = 0; n < tri.length; n++) {
                let inter = [Array.zero, ray].intersect(...tri[n].rotated)
                if (inter && inter[0] && Array.zero.dist(inter[0]) <= ctrid) {
                    ctri = n, ctrid = Array.zero.dist(inter[0])
                }
            }
            if (ctri == null) {
                out.push(0)
                out.push(0)
                out.push(0)
                out.push(255)
            } else {
                out.push(tri[ctri][3][0])
                out.push(tri[ctri][3][1])
                out.push(tri[ctri][3][2])
                out.push(255)
            }
        }
    }
    self.postMessage({ i: y, img: out })
}
