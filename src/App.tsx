import { useEffect, useState } from "react";
import Board from "./components/Board";
import { useChessGame } from "./hooks/useChessGame";
import type { Square } from "chess.js";
import "./App.css";

const AI_RESPONSE_DELAY_MS = 1500;

function App() {
  // 棋盘、重新开始和记录共用同一份棋局。
  const game = useChessGame();
  const { turn, isGameOver, uciHistory, movePiece } = game;
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isThinking =
    turn === "b" && !isGameOver && aiError === null;


  useEffect(() => {
    setAiError(null);

    if (turn !== "b" || isGameOver) return;

    const controller = new AbortController();
    const startedAt = performance.now();

    let cancelled = false;
    let moveTimer: number | undefined;

    // 防止请求一直没有响应
    const timeoutTimer = window.setTimeout(
      () => controller.abort(),
      120_000,
    );




    async function requestMove() {
      try {
        const response = await fetch("http://127.0.0.1:8000/move", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moves: uciHistory,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI request failed: ${response.status}`);
        }

        const move = await response.json();

        // 检查接口返回的数据
        if (
          typeof move.from !== "string" ||
          typeof move.to !== "string" ||
          !/^[a-h][1-8]$/.test(move.from) ||
          !/^[a-h][1-8]$/.test(move.to) ||
          ![null, undefined, "q", "r", "b", "n"].includes(move.promotion)
        ) {
          throw new Error("AI returned an invalid response.");
        }

        if (cancelled) return;

        // 请求本身若已花费超过 1.5 秒，就不用再等待
        const remaining = Math.max(
          0,
          AI_RESPONSE_DELAY_MS - (performance.now() - startedAt),
        );

        moveTimer = window.setTimeout(() => {
          if (cancelled) return;

          const success = movePiece(
            move.from as Square,
            move.to as Square,
            move.promotion ?? "q",
          );

          if (!success) {
            setAiError("AI returned an illegal move. Please retry.");
          }
        }, remaining);
      } catch {
        if (!cancelled) {
          setAiError(
            "Could not get an AI move. Check the Python server and retry.",
          );
        }
      } finally {
        window.clearTimeout(timeoutTimer);
      }
    }

    void requestMove();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(moveTimer);
      window.clearTimeout(timeoutTimer);
    };
  }, [turn, isGameOver, uciHistory, movePiece, retryCount]); return (

    <div className="app">
      <header className="header">
        <h1>KnightShift</h1>
        <button type="button" onClick={game.resetGame}>New game</button>
      </header>

      <main className="game-layout">
        <Board game={game} isThinking={isThinking} />



        <aside className="sidebar">
          <section className="panel">
            <h2>Your opponent</h2>
            <dl className="opponent-details">
              <div>
                <dt>Difficulty</dt>
                <dd>Intermediate</dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>Attacking</dd>
              </div>
            </dl>
          </section>

          <section className="panel move-panel">
            <h2>Move history</h2>
            {game.history.length === 0 ? (
              <p className="empty-state">
                Moves will appear here once the game begins.
              </p>
            ) : (
              <ol className="move-list" aria-label="Move history">
                {game.history.filter((_, index) => index % 2 === 0)
                  .map((whiteMove, index) => (
                    <li key={index}>
                      <span>{whiteMove}</span>
                      <span>{game.history[index * 2 + 1] ?? "—"}</span>
                    </li>
                  ))}
              </ol>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
