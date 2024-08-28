import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";


export class Game {
    public p1: WebSocket;
    public p2: WebSocket;
    private board: Chess;
    private startTime: Date;
    private moveCount: number;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.p1 = player1;
        this.p2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.moveCount = 0;
        this.p1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.p2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }

    makeMove(socket: WebSocket, move: { from: string, to: string }) {
        if (this.moveCount % 2 === 0 && socket !== this.p1) {
            return; //return early if not proper turn
        }
        if (this.moveCount % 2 === 1 && socket !== this.p2) {
            return; //return early if not proper turn
        }
        
        try {
            this.board.move(move);
            this.moveCount++;
        } catch (e) {
            return; //invalid move
        }

        if (this.board.isGameOver()) {
            this.p1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }

        (this.moveCount % 2 === 0 ? this.p1 : this.p2)
            .send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
    }

    
}