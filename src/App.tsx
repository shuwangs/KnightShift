import Board from "./components/Board";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>KnightShift</h1>
        <button type="button">New game</button>
      </header>

      <main className="game-layout">

        <Board />



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
            <p className="empty-state">
              Moves will appear here once the game begins.
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;