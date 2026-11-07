import sys
import threading
from contextlib import asynccontextmanager

import chess
import chess.engine
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Maia 进程一次只处理一个请求
engine_lock = threading.Lock()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 在应用启动时，启动 Maia 引擎进程
    command = [
        sys.executable,
        "-m", "maia3.uci",
        "--model", "maia3-5m",
        "--use-uci-history",
        "--elo", "1500",
    ]

    # 服务启动时加载一次模型
    engine = chess.engine.SimpleEngine.popen_uci(
        command,
        timeout=120,
    )

    try:
        engine.configure({"Temperature": 0})
        engine.ping()
        app.state.engine = engine
        yield
    finally:
        engine.quit()

app = FastAPI(lifespan=lifespan)

# 允许本地 Vite 网页访问 Python 接口
app.add_middleware(
    CORSMiddleware,
    allow_origins=[  
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class MoveRequest(BaseModel):
    # 从初始局面开始的全部走法，使用 UCI 格式
    moves: list[str] = Field(default_factory=list, max_length=2000)

@app.post("/move")
def choose_move(request: MoveRequest):
    board = chess.Board()

    # 根据网页发送的历史，还原棋盘
    try:
        for move in request.moves:
            board.push_uci(move)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="The move history contains an invalid move.",
        )

    if board.is_game_over(claim_draw=True):
        raise HTTPException(
            status_code=409,
            detail="The game is already over.",
        )

    with engine_lock:
        result = app.state.engine.play(
            board,
            chess.engine.Limit(nodes=1),
        )

    if result.move is None:
        raise HTTPException(
            status_code=503,
            detail="The model did not return a move.",
        )

    return {
        "from": chess.square_name(result.move.from_square),
        "to": chess.square_name(result.move.to_square),
        "promotion": (
            chess.piece_symbol(result.move.promotion)
            if result.move.promotion
            else None
        ),
    }