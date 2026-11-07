# KnightShift

A web chess game exploring AI opponents with independently selectable strength and playing style. The goal is to offer distinct opponents—from aggressive attackers to cautious positional players—even at similar skill levels.

## Current status

The local prototype supports human-versus-AI play: you play White, and a Python API runs the pretrained Maia-3 5M model as Black. The model is used for inference; no custom model training has been performed.

The difficulty and style labels in the sidebar are placeholders. The backend currently uses a fixed Elo condition of `1500` and `Temperature: 0` (highest-probability selection). This condition is not a measured playing rating, and style control is not implemented.

### Implemented

- Responsive chessboard with coordinates and 12 custom SVG piece assets.
- Click-to-select and click-to-move interaction with legal destination and capture indicators.
- Legal move validation through `chess.js`, including castling and en passant.
- Automatic queen promotion for player moves; AI promotions use the returned piece type.
- Turn, check, checkmate, and draw status, plus SAN move history.
- Maia responses requested using the complete UCI move history.
- Thinking feedback with a minimum 1.5-second response interval, including inference time.
- Response validation, a 120-second request timeout, and cancellation of frontend requests and pending moves when restarting or leaving the page.
- A **New game** button to reset the board and history.

## Getting started

Run the Python backend and Vite frontend in separate terminals. Both must remain running to play against Maia.

### Requirements

- Node.js 22.12+ and npm.
- Python 3.10+ and `venv`, with a version supported by the installed PyTorch release. Local development has used Python 3.13.
- Internet access for installing dependencies and downloading model weights initially.

### 1. Set up the Python environment

From the project root:

```bash
cd experiments
python3 -m venv .venv
source .venv/bin/activate
```

The activation command above is for macOS/Linux.

Ensure the upstream Maia source is available at `experiments/maia3`. If `maia3/pyproject.toml` is missing, clone it:

```bash
git clone https://github.com/CSSLab/maia3.git maia3
```

If Git reports that `maia3` already exists, inspect that directory first. A fresh checkout may contain an empty directory because the repository currently records Maia as a Git link without a `.gitmodules` configuration; remove the directory only if it is empty, then retry the clone.

For the Maia revision used during this integration, run from `experiments/maia3`:

```bash
git checkout 1e13597c42d4858b7cfd7cfdae01e297263364b2
```

Then install from `experiments/`:

```bash
python -m pip install ./maia3
python -m pip install fastapi uvicorn python-chess
maia3-cache
```

`maia3-cache` downloads the default model to the local Hugging Face cache. Subsequent runs reuse the downloaded weights. Python dependencies are not yet pinned in a project requirements file.

### 2. Start the backend

From `experiments/`, with the virtual environment activated:

```bash
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Wait for `Application startup complete`. The service starts one Maia engine process and reuses it; inference requests are serialized with a lock.

Open [the local API docs](http://127.0.0.1:8000/docs) to test the endpoint independently of the frontend.

### 3. Start the frontend

In a second terminal, from the project root:

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The backend allows `localhost` and `127.0.0.1` origins on ports **5173** and **5174**. If Vite uses another port or hostname, add that exact origin to `allow_origins` in `experiments/api.py` and restart the backend.

### 4. Play

1. Select a white piece, then select a highlighted destination; try **e2 → e4**.
2. Wait for Maia to respond as Black. Board interaction is disabled during Black's turn.
3. Continue playing White. Move history appears in the sidebar.
4. Click **New game** to restart.

State is held in memory; refreshing the page resets the game. Restarting ignores old frontend responses, but does not necessarily stop inference already running in the backend.

## API

The frontend currently calls `http://127.0.0.1:8000/move` directly.

**POST `/move`** accepts the full sequence of UCI moves from the standard starting position:

```json
{
  "moves": ["e2e4"]
}
```

Example response:

```json
{
  "from": "e7",
  "to": "e5",
  "promotion": null
}
```

`promotion` is `q`, `r`, `b`, `n`, or `null`. UCI moves encode origin, destination, and any promotion suffix, for example `e7e8q`. The frontend displays SAN notation such as `e4` or `Nf3` separately.

The backend rebuilds the board using `python-chess`, rejects invalid histories with HTTP 400, rejects ended or claimable-draw positions with HTTP 409, and requests a move from Maia. A missing model move produces HTTP 503. These examples use the default initial position; custom starting positions are not supported by the request schema.

## Commands

| Command | Working directory | Purpose |
| --- | --- | --- |
| `npm run dev` | Project root | Start Vite |
| `npm run build` | Project root | Run TypeScript checks and build into `dist/` |
| `npm run preview` | Project root | Preview the production frontend build |
| `npm run lint` | Project root | Run Oxlint |
| `python -m uvicorn api:app --host 127.0.0.1 --port 8000` | `experiments/` | Start the AI API |
| `python try_maia.py` | `experiments/` | Print Maia's response to e4 and the resulting board |

Activate the virtual environment before running Python commands. There is currently no automated test suite configured.

## Project structure

```text
experiments/
  api.py                # FastAPI service and persistent Maia engine
  try_maia.py           # Standalone inference demonstration
  maia3/                # Upstream Maia implementation
public/
  pieces/               # White and black SVGs for all six piece types
src/
  components/
    Board.tsx           # Board rendering, interactions, and status
  hooks/
    useChessGame.ts     # Chess state, selection, legal moves, and history
  App.tsx               # AI requests, response timing, and move history UI
  App.css               # Game layout and board styling
  index.css             # Global styles
  main.tsx              # Application entry point
```

The frontend uses React, TypeScript, Vite, `chess.js`, CSS, and SVG. The backend uses FastAPI, `python-chess`, and Maia-3/PyTorch over UCI. `App` owns one `useChessGame` instance so the board, history, and reset action share the same state.

## Known limitations

- Player color and AI Elo are fixed; difficulty and style controls are planned.
- No custom training, Stockfish evaluation, or measured strength calibration yet.
- Request errors are tracked internally, but the current UI does not display the error or expose a retry button. If the AI stops responding, check the backend logs, restore the service, and start a new game.
- Draws use library game-over checks rather than a separate player claim flow. The frontend and backend draw policies still need to be aligned: the backend also rejects positions where a draw can be claimed on the next move.
- No promotion picker, resignation, PGN download, persistence, or accounts.
- The hardcoded API URL, CORS origins, and local inference service require configuration before deployment. The preview server's origin is not currently allowed by the backend.

## Roadmap

- Add visible request errors and retry controls.
- Align draw handling and add automated game-flow tests.
- Add player color selection, a promotion picker, resignation, and PGN export.
- Evaluate Maia across fixed positions and skill conditions using Stockfish as a quality reference.
- Prototype recognizable playing styles while keeping strength comparable.
- Explore human-game datasets and fine-tuning after establishing evaluation baselines.
- Add local persistence and prepare the frontend/backend for deployment.

Web is the initial target. Additional platform integrations will be evaluated after the core experience is validated.

## Upstream model

Maia-3 is developed by [UofT CSSLab](https://github.com/CSSLab/maia3). Its source includes an AGPL-3.0 license; consult the upstream code and model-weight license terms when planning distribution and deployment. This repository does not define a separate license for those upstream assets.
