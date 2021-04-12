from manim import *
from math import cos, sin, sqrt, atan2

from xml.dom import minidom
doc = minidom.parse('./pi.svg')  # parseString also exists
svgString = [
    path.getAttribute('d') for path in doc.getElementsByTagName('path')
][0] + ' '
doc.unlink()

commands = 'mlvhqz'


def isCommand(s):
    for c in commands:
        if c == s:
            return True
    return False


def SVGReader(svg):
    #make sure i always lands on INSTRUCTION start
    i = 0
    instruct = []
    while i < len(svg):
        co, c = [], svg[i]
        i = i + 2
        while i < len(svg) and not isCommand(svg[i]):
            I = 0
            while i < len(svg) and svg[i] != ' ':
                x = ''
                while i < len(svg) and svg[i] != ' ' and svg[i] != ',':
                    x = x + svg[i]
                    i = i + 1
                co.append(float(x))
                if i < len(svg) and svg[i] == ',':
                    i = i + 1
                I = I + 1
            i = i + 1

        instruction = [c]
        for I in co:
            instruction.append(I)
        instruct.append(instruction)

    lx, ly, sx, sy, out = 0, 0, 0, 0, [],
    for i in range(len(instruct)):
        s = instruct[i]
        if s[0] == 'm':
            lx, ly = ly + s[1], lx + s[2]
            sx, sy = lx, ly
        if s[0] == 'l':
            out.append(['l', lx, ly, lx + s[1], ly + s[2]])
            lx, ly = lx + s[1], ly + s[2]
        if s[0] == 'h':
            out.append(['l', lx, ly, lx + s[1], ly])
            lx = lx + s[1]
        if s[0] == 'v':
            out.append(['l', lx, ly, lx, ly + s[1]])
            ly = ly + s[1]
        if s[0] == 'q':
            l = len(s) // 4
            for I in range(l):
                out.append([
                    'q', lx, ly, lx + s[4 * I + 1], ly + s[4 * I + 2],
                    lx + s[4 * I + 3], ly + s[4 * I + 4]
                ])
                lx, ly = lx + s[4 * I + 3], ly + s[4 * I + 4]
        if s[0] == 'z':
            out.append(['l', lx, ly, sx, sy])

    return out


def merge(a, b, o, io):
    return io * a + o * b


def SVGBezier(x1, y1, x2, y2, x3, y3, o, io):
    ax, ay = merge(x1, x2, o, io), merge(y1, y2, o, io)
    bx, by = merge(x2, x3, o, io), merge(y2, y3, o, io)
    return merge(ax, bx, o, io), merge(ay, by, o, io)


def SVGCubicBezier(x1, y1, x2, y2, x3, y3, x4, y4, o, io):
    ax, ay = merge(x1, x2, o, io), merge(y1, y2, o, io)
    bx, by = merge(x2, x3, o, io), merge(y2, y3, o, io)
    cx, cy = merge(x3, x4, o, io), merge(y3, y4, o, io)
    return SVGBezier(ax, ay, bx, by, cx, cy, o, io)


def SVGtoFunction(t):
    svg = SVGReader(svgString)
    l = len(svg)
    for i in range(l):
        IN = t >= i / l and t < (i + 1) / l
        if IN:
            o = t * l - i
            io = 1 - o
            s = svg[i]
            if s[0] == 'l':
                return merge(s[1], s[3], o, io), merge(s[2], s[4], o, io)

            if s[0] == 'q':
                return SVGBezier(s[1], s[2], s[3], s[4], s[5], s[6], o, io)

            if s[0] == 'c':
                return SVGCubicBezier(s[1], s[2], s[3], s[4], s[5], s[6], s[7],
                                      s[8], o, io)
    return svg[-1][-2], svg[-1][-1]


class Fourier(GraphScene):
    def indexToTerm(self, i):
        i = 2 * self.cycleCount - i
        p = self.cycleCount - i // 2
        return -p if (i % 2 == 0) else p

    def construct(self):
        self.cycleCount, self.a, self.p = 20, [], []
        t = ValueTracker(0)

        def cUp(m):
            tx, ty = self.Fourier(m.i, t.get_value())
            m.move_arc_center_to([tx, ty, 0])

        def dUp(m):
            tx, ty = self.Fourier(m.i, t.get_value())
            m.move_to([tx, ty, 0])

        def lUp(m):
            x, y = self.Fourier(m.i, t.get_value())
            nx, ny = self.Fourier(m.i + 1, t.get_value())
            if x != nx or y != ny:
                m.put_start_and_end_on([x, y, 0], [nx, ny, 0])

        for i in range(2 * self.cycleCount + 1):
            n = self.indexToTerm(i)
            a, p = self.FFT(n)
            self.a.append(a)
            self.p.append(p)

            x, y = self.Fourier(i, t.get_value())
            nx, ny = self.Fourier(i + 1, t.get_value())

            c = Circle(radius=self.a[i], arc_center=[x, y, 0])
            d = Dot(radius=self.a[i] * 0.1, point=[x, y, 0])
            l = Line(start=[x, y, 0], end=[nx, ny, 0])
            self.add(c, d, l)

            l.i = i
            c.i = i
            d.i = i
            c.add_updater(cUp)
            d.add_updater(dUp)
            l.add_updater(lUp)
            self.add(c, d, l)

        def func(z):
            x, y = self.Function(z)
            return [x, y, 0]

        def ffunc(z):
            out = self.FourierFunction(z)
            return out

        f = ParametricFunction(func,
                               min_t=0,
                               max_t=1,
                               color=BLUE,
                               step_size=0.005)
        ff = ParametricFunction(ffunc,
                                min_t=0,
                                max_t=1,
                                color=YELLOW,
                                stroke_opacity=0.5,
                                stroke_width=3,
                                step_size=0.01)
        self.add(f)

        trail = Dot(radius=0.1,
                    point=[self.FourierFunction(t.get_value())],
                    color=YELLOW,
                    fill_opacity=0.5)
        trail.i = 2 * self.cycleCount + 1
        self.add(trail)
        trail.add_updater(dUp)
        self.add(trail)

        self.play(
            t.animate.set_value(1),
            ShowCreation(ff),
            #   MoveAlongPath(trail, ff),
            rate_func=linear,
            run_time=6)
        self.wait(2)

    def FourierFunction(self, t):
        x, y = self.Fourier(2 * self.cycleCount + 1, t)
        return [x, y, 0]

    def Fourier(self, N, t):
        x, y = 0.0, 0.0
        for i in range(N):
            n = self.indexToTerm(i)
            x = x + self.a[i] * cos(TAU * n * t + self.p[i])
            y = y + self.a[i] * sin(TAU * n * t + self.p[i])
        return x, y

    def Function(self, t):
        x, y = SVGtoFunction(t)
        return (x - 400) / 50, (700 - y) / 50

    def FFT(self, N):
        x, y, dt = 0.0, 0.0, 64
        for t in range(dt):
            a, b = self.Function(t / dt)
            theta = -N * t * TAU / dt
            c, s = cos(theta), sin(theta)
            x = x + (a * c - b * s) / dt
            y = y + (b * c + a * s) / dt
        return sqrt(x**2 + y**2), atan2(y, x)
