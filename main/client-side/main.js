const port = 'https://nickdevserver.herokuapp.com/';
var socket = io.connect(port);
var game = new Game(
    new Pawn(0, 6), new Pawn(1, 6), new Pawn(2, 6), new Pawn(3, 6),
    new Pawn(4, 6), new Pawn(5, 6), new Pawn(6, 6), new Pawn(7, 6),
    new Rook(0, 7), new Rook(7, 7),
    new Bishop(2, 7), new Bishop(5, 7),
    new Knight(1, 7), new Knight(6, 7),
    new King(4, 7), new Queen(3, 7),

    new Pawn(0, 1), new Pawn(1, 1), new Pawn(2, 1), new Pawn(3, 1),
    new Pawn(4, 1), new Pawn(5, 1), new Pawn(6, 1), new Pawn(7, 1),
    new Rook(0, 0), new Rook(7, 0),
    new Bishop(2, 0), new Bishop(5, 0),
    new Knight(1, 0), new Knight(6, 0),
    new King(4, 0), new Queen(3, 0),
);
game.clientTurn = null;

socket.on('update', (data) => {
    let { piece: id, x, y } = data
    let p = game.pieces[id]

    p.makeMove(x, y, true)
    p.render()

    game.serverTurn = game.clientTurn
})
socket.on('ready', (i) => {
    board.className = 'connect'
    game.setTurn(i)
    game.moveMade = function (p, x, y) {
        game.serverTurn = game.clientTurn.not
        socket.emit('update', { piece: p.rid, x, y })
    }
    // socket.emit('update', p1)
})
socket.on('leave', () => {
    game.removeHighlights()
    board.className = 'disconnect'
    game.clientTurn = null;
})