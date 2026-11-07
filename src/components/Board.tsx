import type { PieceSymbol, Square } from "chess.js";
import type { useChessGame } from "../hooks/useChessGame";

const pieceNames: Record<PieceSymbol, string> = {
    k: "king",
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
    p: "pawn",
};

type BoardProps = {
    game: ReturnType<typeof useChessGame>;
    isThinking: boolean;
};

const Board = ({ game, isThinking }: BoardProps) => {
    const {
        board, turn, selectedSquare, legalMoves, handleSquareClick,
        isCheck, isCheckmate, isDraw, isGameOver,
    } = game;
    const side = turn === "w" ? "White" : "Black";
    const status = isCheckmate
        ? `Checkmate — ${turn === "w" ? "Black" : "White"} wins`
        : isDraw
            ? "Game over — draw"
            : isThinking
                ? `AI is thinking…${isCheck ? " — Black is in check" : ""}`
                : `${side} to move${isCheck ? " — check!" : ""}`;

    return (
        <section className="board-area" aria-label="Game area">
            <p className="game-status" role="status">{status}</p>
            <div className="board" aria-label="Chessboard">
                {board.map((rank, row) => rank.map((piece, column) => {
                    const file = "abcdefgh"[column];
                    const coordinate = `${file}${8 - row}` as Square;
                    const isDark = (row + column) % 2 === 1;
                    const isSelected = selectedSquare === coordinate;
                    const isLegal = legalMoves.includes(coordinate);
                    const color = piece?.color === "w" ? "white" : "black";
                    const name = piece ? `${color} ${pieceNames[piece.type]}` : "empty";

                    return (
                        <button
                            type="button"
                            key={coordinate}
                            className={[
                                "square", isDark ? "dark" : "light",
                                isSelected ? "selected" : "",
                                isLegal ? (piece ? "legal-capture" : "legal-move") : "",
                            ].filter(Boolean).join(" ")}
                            aria-label={`${coordinate}, ${name}${isLegal ? ", legal destination" : ""}`}
                            aria-pressed={isSelected}
                            disabled={isGameOver || turn === "b"}
                            onClick={() => handleSquareClick(coordinate)}
                        >
                            {piece && (
                                <img
                                    className="piece"
                                    src={`${import.meta.env.BASE_URL}pieces/${color}-${pieceNames[piece.type]}.svg`}
                                    alt=""
                                    draggable={false}
                                    width={128}
                                    height={128}
                                />
                            )}
                            {column === 0 && <span className="rank">{8 - row}</span>}
                            {row === 7 && <span className="file">{file}</span>}
                        </button>
                    );
                }))}
            </div>
        </section>
    );
};

export default Board;
