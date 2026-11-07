# KnightShift

A web chess game exploring AI opponents with independently selectable strength and playing style. The goal is to offer distinct opponents—from aggressive attackers to cautious positional players—even at similar skill levels.

## Current status

The project currently provides a playable local chessboard. One person controls both sides, or two players can share the same device. AI opponents are not connected yet; the difficulty and style displayed in the sidebar are placeholders.

### Implemented

- Responsive board with coordinates and 12 custom SVG piece assets.
- Click-to-select and click-to-move interaction, with legal destination and capture indicators.
- Legal move validation and alternating turns through `chess.js`, including castling and en passant.
- Automatic promotion to a queen.
- Turn, check, checkmate, and draw status.
- Move history in standard algebraic notation (SAN).
- A **New game** button to reset the board and history.

Game state is kept in memory; refreshing the page starts a new game. Draws currently follow `chess.js`'s automatic game-over checks, including threefold repetition and the fifty-move rule, without a separate claim action.

## Getting started

Use Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To try the board:

1. Click the white pawn on **e2**. Its legal destinations appear.
2. Click **e4** to move it.
3. Play Black's reply, such as **e7 → e5**.
4. Continue alternating sides. Click the selected piece again to deselect it, or another friendly piece to switch selection.
5. Click **New game** to restart.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Run TypeScript checks and create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

There is currently no automated test suite configured.

## Technology

- **React + TypeScript** for the interface and state management.
- **Vite** for development and production builds.
- **chess.js** for chess rules, legal moves, notation, and game status.
- **CSS** for responsive layouts and board highlights.
- **SVG** for the rounded, expressive chess pieces.
- **Oxlint** for linting.

The current application runs entirely in the browser and requires no backend or API keys.

## Project structure

```text
public/
  pieces/               # White and black SVGs for all six piece types
src/
  components/
    Board.tsx           # Board rendering, square buttons, and status
  hooks/
    useChessGame.ts     # Chess state, selection, legal moves, and reset
  App.tsx               # Shared game instance, sidebar, and move history
  App.css               # Game layout and board styling
  index.css             # Global styles
  main.tsx              # Application entry point
```

`App` owns one `useChessGame` instance and passes it to `Board`, keeping the board, move history, and reset action synchronized. The hook returns board data and actions while keeping its `Chess` instance private. Successful moves create a new instance with the full game history preserved.

## Roadmap

### Complete the human-versus-AI experience

- Connect a chess engine as an initial AI baseline.
- Add player color selection and AI thinking feedback.
- Introduce and calibrate difficulty levels.
- Add a promotion picker, resignation, and PGN export.
- Save and resume unfinished games locally.
- Add automated interaction and chess-rule regression checks.

### Validate distinct playing styles

- Prototype attacking and solid playing preferences.
- Evaluate style differences while keeping strength comparable.
- Use fixed positions, automated matches, and player feedback to test whether styles are recognizable.

### Explore human-game models

- Identify suitable human-game datasets and verify usage permissions.
- Establish a move-prediction baseline, then experiment with strength and style conditioning.
- Compare trained models against the engine baseline before choosing a model, engine, or hybrid approach.

Model training is a separate research track and is not a prerequisite for the first AI-enabled version. Web is the initial target; additional platform integrations will be evaluated after the core experience is validated.
