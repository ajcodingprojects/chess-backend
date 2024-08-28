"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.p1 = player1;
        this.p2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.moveCount = 0;
        this.p1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.p2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    makeMove(socket, move) {
        if (this.moveCount % 2 === 0 && socket !== this.p1) {
            return; //return early if not proper turn
        }
        if (this.moveCount % 2 === 1 && socket !== this.p2) {
            return; //return early if not proper turn
        }
        try {
            this.board.move(move);
            this.moveCount++;
        }
        catch (e) {
            return; //invalid move
        }
        if (this.board.isGameOver()) {
            this.p1.emit(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }
        (this.moveCount % 2 === 0 ? this.p1 : this.p2)
            .send(JSON.stringify({
            type: messages_1.MOVE,
            payload: move
        }));
    }
}
exports.Game = Game;
