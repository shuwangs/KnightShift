import sys
import chess
import chess.engine
def print_board(board):
    # 从第 8 行到第 1 行打印棋盘
    for rank in range(7, -1, -1):
        squares = []

        for file in range(8):
            square = chess.square(file, rank)
            piece = board.piece_at(square)

            # 大写代表白方，小写代表黑方，点代表空格
            squares.append(piece.symbol() if piece else ".")

        print(f"{rank + 1}  {' '.join(squares)}")

    print("\n   a b c d e f g h\n")

command = [    
    sys.executable,
    "-m", "maia3.uci",
    "--model", "maia3-5m",
    "--use-uci-history",
    "--elo", "1500",
    ]

board = chess.Board()
board.push_uci("e2e4")

with chess.engine.SimpleEngine.popen_uci(
    command,
    timeout=120,
) as engine:
    engine.configure({"Temperature": 0})

    result = engine.play(
        board,
        chess.engine.Limit(nodes=1),
    )

    if result.move is not None:
        # 必须在更新棋盘之前，读取这一步的记谱
        notation = board.san(result.move)

        print(f"Maia chose: {result.move.uci()} ({notation})\n")

        # 真正把模型选择的走法应用到棋盘
        board.push(result.move)

        print("Board after Maia's move:\n")
        print_board(board)