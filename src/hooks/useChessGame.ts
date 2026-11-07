import { useState } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";

type Promotion = "q" | "r" | "b" | "n";

export function useChessGame() {
    // Chess 管理唯一的棋局状态；每次走棋创建新实例，让 React 更新画面。
    const [game, setGame] = useState(() => new Chess());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

    // board 是 8×8 数组，每格是棋子对象或 null；第 0 行对应第 8 横线。
    const board = game.board();
    const turn = game.turn(); // "w" 为白方，"b" 为黑方
    const isGameOver = game.isGameOver();

    const legalMoves = selectedSquare && !isGameOver
        ? [...new Set(
            game.moves({ square: selectedSquare, verbose: true })
                .map((move) => move.to),
        )]
        : [];

    // 返回 true 表示走棋成功，false 表示非法走法或对局已经结束。
    const movePiece = (
        from: Square,
        to: Square,
        promotion: Promotion = "q",
    ): boolean => {
        if (game.isGameOver()) return false;

        // 保留完整历史，确保三次重复等依赖历史的规则仍然有效。
        const nextGame = new Chess();
        nextGame.loadPgn(game.pgn());

        try {
            nextGame.move({ from, to, promotion });
        } catch {
            // chess.js 会为非法走法抛出异常；原棋局保持不变。
            return false;
        }

        setGame(nextGame);
        setSelectedSquare(null);
        return true;
    };

    const handleSquareClick = (square: Square) => {
        if (isGameOver) return;

        // 再次点击已选中的格子，取消选中。
        if (square === selectedSquare) {
            setSelectedSquare(null);
            return;
        }

        const piece = game.get(square);

        // 点击当前行棋方的棋子，选中或切换选中。
        if (piece?.color === turn) {
            setSelectedSquare(square);
            return;
        }

        // 点击空格或对方棋子，尝试移动或吃子。
        if (selectedSquare) {
            movePiece(selectedSquare, square);
        }
    };

    const resetGame = () => {
        setGame(new Chess());
        setSelectedSquare(null);
    };

    return {
        board,
        turn,
        selectedSquare,
        legalMoves,
        history: game.history(),
        fen: game.fen(),
        pgn: game.pgn(),
        isCheck: game.isCheck(),
        isCheckmate: game.isCheckmate(),
        isDraw: game.isDraw(),
        isGameOver,
        handleSquareClick,
        movePiece,
        resetGame,
    };
}

export default useChessGame;
