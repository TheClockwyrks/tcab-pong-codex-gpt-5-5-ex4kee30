# Carom

Carom is a top-down browser paddle duel built on the Simple 2D engine. Two
players, or one player against the AI, trade a fast ricocheting ball across a
dark field with two central obstacles. Paddle movement at impact adds spin, so a
well-timed hit can curve the next shot into a bank angle that is hard to read.

## Install

```sh
npm ci
```

## Run In Development

```sh
npm run dev
```

Open the URL Vite prints. The game runs entirely in the browser with no backend
or runtime asset downloads.

## Production Build

```sh
npm run build
```

The static site is written to `dist/` with `dist/index.html` as its entry point.
Serve that directory from the root of any static file server.

## Controls

- Player 1: `W` / `S`
- Player 2: `ArrowUp` / `ArrowDown`
- Solo mode: either movement pair controls the left paddle
- Confirm: `Enter` or `Space`
- Back: `Escape`
- Pause: `P` or `Escape`
- Mute: `M`

Menus also work with mouse or touch, and touch devices get the engine's
dual-vertical on-screen controls.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```
