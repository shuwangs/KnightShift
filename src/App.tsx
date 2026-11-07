import { useEffect } from "react";
import Board from "./components/Board";
import { useChessGame } from "./hooks/useChessGame";
import "./App.css";

const AI_RESPONSE_DELAY_MS = 1500;

function App() {
  // 棋盘、重新开始和记录共用同一份棋局。
  const game = useChessGame();
  const { turn, isGameOver, getRandomMove, movePiece } = game;
  const isThinking = turn === "b" && !isGameOver;
  useEffect(() => {
    if (turn !== "b" || isGameOver) return;

    const timer = window.setTimeout(() => {
      const move = getRandomMove();

      if (move) {
        const promotion = move.promotion;
        movePiece(
          move.from,
          move.to,
          promotion === "r" || promotion === "b" || promotion === "n"
            ? promotion
            : "q",
        );
      }
    }, AI_RESPONSE_DELAY_MS);

    // 重新开始、局面改变或组件卸载时，取消旧的待执行走法
    return () => window.clearTimeout(timer);
  }, [turn, isGameOver, getRandomMove, movePiece]);

  return (

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
