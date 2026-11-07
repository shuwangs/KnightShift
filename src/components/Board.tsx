// src/components/Board.tsx

// 将棋子符号对应到 public/prices 中的 SVG 文件。
const pieceAssets: Record<string, string> = {
    "♜": "black-rook",
    "♞": "black-knight",
    "♝": "black-bishop",
    "♛": "black-queen",
    "♚": "black-king",
    "♟": "black-pawn",
    "♖": "white-rook",
    "♘": "white-knight",
    "♗": "white-bishop",
    "♕": "white-queen",
    "♔": "white-king",
    "♙": "white-pawn",
};

const Board = () => {
    const initialPosition = [
        ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"], // 黑方后排
        ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"], // 黑兵
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"], // 白兵
        ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"], // 白方后排
    ];

    // 创建一个包含 64 个格子的数组
    const squares = Array.from({ length: 64 }, (_, index) => {
        // 行和列都从 0 开始
        const row = Math.floor(index / 8);
        const column = index % 8;

        // 决定格子的颜色
        const isDark = (row + column) % 2 === 1;

        // 把行列转换为棋盘坐标，例如 a8、b8、c8
        const file = "abcdefgh"[column];
        const rank = 8 - row;
        const coordinate = `${file}${rank}`;

        // 从初始布局中，取出当前格子的棋子
        const piece = initialPosition[row][column];

        return (
            <div
                key={coordinate}
                className={`square ${isDark ? "dark" : "light"}`}
                aria-label={coordinate}
            >
                {/* 棋子 */}
                {piece && (
                    <img
                        className="piece"
                        src={`${import.meta.env.BASE_URL}pieces/${pieceAssets[piece]}.svg`}
                        alt={pieceAssets[piece].replace("-", " ")}
                        draggable={false}
                        width={128}
                        height={128}
                    />
                )}

                {/* 左侧显示行号：8 到 1 */}
                {column === 0 && <span className="rank">{rank}</span>}

                {/* 底部显示列名：a 到 h */}
                {row === 7 && <span className="file">{file}</span>}
            </div>
        );
    });

    return (
        <div className="board" aria-label="Chessboard">
            {squares}
        </div>
    );
};

export default Board;
