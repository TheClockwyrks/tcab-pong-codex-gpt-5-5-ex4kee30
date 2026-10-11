import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_HH,
  OBSTACLE_W,
  OBSTACLE_HW,
  OBSTACLES,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_H,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";

export type Mode = "solo" | "versus";

export type Side = "left" | "right";

export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}

export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}

export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}

export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}

export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";

  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;

  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;

  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];

  readonly simTime: number;
  readonly muted: boolean;
}

export interface CaromSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: {
    readonly left: PaddleState;
    readonly right: PaddleState;
  };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball:
    | (BallState & {
        readonly speed: number;
      })
    | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
}

export interface MenuItemRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface CaromDebugApi {
  readonly version: number;
  clearWorld(state: DeepReadonly<CaromState>): CaromState;
  spawnBall(state: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(state: DeepReadonly<CaromState>, index: number): CaromState;
  reset(state: DeepReadonly<CaromState>): CaromState;
  reconcile(state: DeepReadonly<CaromState>): CaromState;
  setScreen(state: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(state: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    state: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(state: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(state: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(state: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(
    state: DeepReadonly<CaromState>,
    side: Side,
    cy: number,
  ): CaromState;
  setPaddleVy(
    state: DeepReadonly<CaromState>,
    side: Side,
    vy: number,
  ): CaromState;
  setPaddleDriven(
    state: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    state: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    state: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(state: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(state: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(
    state: DeepReadonly<CaromState>,
    seconds: number,
  ): CaromState;
  setBallServeSign(state: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(state: DeepReadonly<CaromState>): CaromState;
  setAiTracking(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(state: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(state: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    state: DeepReadonly<CaromState>,
    index: number,
  ): MenuItemRect | null;
}

type Rect = { x0: number; y0: number; x1: number; y1: number };
type HitFace = "left" | "right" | "top" | "bottom";
type CollisionKind = "none" | "paddle" | "wall" | "obstacle";

const FIELD_FILL = "#07111c";
const PANEL_FILL = "rgba(7, 17, 28, 0.76)";
const P1_FILL = "#36d6ff";
const P2_FILL = "#ff5c8a";
const BALL_FILL = "#f9f871";
const OBSTACLE_FILL = "#42f59b";
const TEXT_FILL = "#eef7ff";
const DIM_TEXT = "#89a3b8";
const MENU_FILL = "#f9f871";
const SHADOW = "rgba(39, 225, 255, 0.22)";

export const BACKGROUND = FIELD_FILL;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function drawServeSign(): 1 | -1 {
  return Math.random() < 0.5 ? -1 : 1;
}

function cloneState(state: DeepReadonly<CaromState>): CaromState {
  return {
    screen: state.screen,
    mode: state.mode,
    menuIndex: state.menuIndex,
    titleIndex: state.titleIndex,
    resumeScreen: state.resumeScreen,
    score: { p1: state.score.p1, p2: state.score.p2 },
    winner: state.winner,
    paddles: {
      left: { ...state.paddles.left },
      right: { ...state.paddles.right },
    },
    ai: { ...state.ai },
    receiver: state.receiver,
    ball: state.ball ? { ...state.ball, trail: [...state.ball.trail] } : null,
    obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
    simTime: state.simTime,
    muted: state.muted,
  };
}

function parkedBall(): BallState {
  return {
    x: FIELD_CX,
    y: FIELD_CY,
    vx: 0,
    vy: 0,
    spin: 0,
    held: true,
    holdTimer: HOLD_TIME,
    serveSign: drawServeSign(),
    trail: [],
  };
}

function initialObstacles(): ObstacleState[] {
  return OBSTACLE_CENTERS.map((center, index) => ({
    index,
    cx: center.x,
    cy: center.y,
  }));
}

function titleState(muted: boolean, simTime = 0, titleIndex = 0): CaromState {
  return {
    screen: "title",
    mode: "solo",
    menuIndex: titleIndex,
    titleIndex,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: {
      left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
      right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    },
    ai: { tracking: true, movement: true },
    receiver: "left",
    ball: parkedBall(),
    obstacles: initialObstacles(),
    simTime,
    muted,
  };
}

function startMatch(state: DeepReadonly<CaromState>, mode: Mode): CaromState {
  return {
    ...cloneState(state),
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    paddles: {
      left: { ...state.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...state.paddles.right, cy: FIELD_CY, vy: 0 },
    },
    ball: parkedBall(),
    obstacles: initialObstacles(),
  };
}

function returnToTitle(state: DeepReadonly<CaromState>): CaromState {
  return titleState(state.muted, state.simTime, state.titleIndex);
}

function menuLength(screen: Screen): number {
  if (screen === "title") return TITLE_ITEMS.length;
  if (screen === "howto") return 1;
  if (screen === "paused") return PAUSE_ITEMS.length;
  if (screen === "matchover") return MATCHOVER_ITEMS.length;
  return 0;
}

function menuItemRect(
  state: DeepReadonly<CaromState>,
  index: number,
): MenuItemRect | null {
  const count = menuLength(state.screen);
  if (count === 0 || index < 0 || index >= count) return null;
  const w = state.screen === "howto" ? 280 : 330;
  const h = 56;
  const gap = 18;
  const top =
    state.screen === "title"
      ? 360
      : state.screen === "howto"
        ? 570
        : state.screen === "paused"
          ? 345
          : 410;
  return {
    x: FIELD_CX - w / 2,
    y: top + index * (h + gap),
    w,
    h,
  };
}

function rectIndexAt(
  state: DeepReadonly<CaromState>,
  x: number,
  y: number,
): number | null {
  const count = menuLength(state.screen);
  for (let i = 0; i < count; i += 1) {
    const rect = menuItemRect(state, i);
    if (
      rect &&
      x >= rect.x &&
      x <= rect.x + rect.w &&
      y >= rect.y &&
      y <= rect.y + rect.h
    ) {
      return i;
    }
  }
  return null;
}

function wrapMenu(index: number, count: number, delta: -1 | 1): number {
  return (index + delta + count) % count;
}

function confirmMenu(
  state: DeepReadonly<CaromState>,
  index: number,
): CaromState {
  if (state.screen === "title") {
    const base = { ...cloneState(state), titleIndex: index };
    if (index === 0) return startMatch(base, "solo");
    if (index === 1) return startMatch(base, "versus");
    return { ...base, screen: "howto", menuIndex: 0 };
  }
  if (state.screen === "howto") return returnToTitle(state);
  if (state.screen === "paused") {
    if (index === 0)
      return { ...cloneState(state), screen: state.resumeScreen };
    if (index === 1) return startMatch(state, state.mode);
    return returnToTitle(state);
  }
  if (state.screen === "matchover") {
    if (index === 0) return startMatch(state, state.mode);
    return returnToTitle(state);
  }
  return cloneState(state);
}

function integratePaddle(
  paddle: DeepReadonly<PaddleState>,
  desiredVy: number,
  dt: number,
): PaddleState {
  if (dt <= 0) return { ...paddle, vy: 0 };
  const nextCy = clamp(
    paddle.cy + desiredVy * dt,
    PADDLE_MIN_CY,
    PADDLE_MAX_CY,
  );
  return {
    ...paddle,
    cy: nextCy,
    vy: (nextCy - paddle.cy) / dt,
  };
}

function playerVy(up: number, down: number): number {
  return (down - up) * PADDLE_SPEED;
}

function movePaddles(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
  dt: number,
): CaromState {
  let leftVy: number;
  let rightVy: number;

  if (state.paddles.left.driven) {
    leftVy = state.paddles.left.drivenVy;
  } else if (state.mode === "solo") {
    leftVy = playerVy(
      Math.max(api.input.value("p1-up"), api.input.value("p2-up")),
      Math.max(api.input.value("p1-down"), api.input.value("p2-down")),
    );
  } else {
    leftVy = playerVy(api.input.value("p1-up"), api.input.value("p1-down"));
  }

  if (state.paddles.right.driven) {
    rightVy = state.paddles.right.drivenVy;
  } else if (state.mode === "solo") {
    rightVy = aiVelocity(state, dt);
  } else {
    rightVy = playerVy(api.input.value("p2-up"), api.input.value("p2-down"));
  }

  return {
    ...cloneState(state),
    paddles: {
      left: integratePaddle(state.paddles.left, leftVy, dt),
      right: integratePaddle(state.paddles.right, rightVy, dt),
    },
  };
}

function aiVelocity(state: DeepReadonly<CaromState>, dt: number): number {
  if (!state.ai.movement || dt <= 0) return 0;
  let target = AI_HOME_Y;
  let deadzone = AI_HOME_DEADZONE;
  if (
    state.ai.tracking &&
    state.screen === "playing" &&
    state.ball &&
    state.ball.vx > 0
  ) {
    target = state.ball.y - state.ball.vy * AI_REACT;
    deadzone = AI_DEADZONE;
  }
  const diff = target - state.paddles.right.cy;
  if (Math.abs(diff) <= deadzone) return 0;
  return Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
}

function rectForPaddle(side: Side, cy: number): Rect {
  return side === "left"
    ? { x0: P1_X0, x1: P1_X1, y0: cy - PADDLE_HALF, y1: cy + PADDLE_HALF }
    : { x0: P2_X0, x1: P2_X1, y0: cy - PADDLE_HALF, y1: cy + PADDLE_HALF };
}

function collideCircleRect(
  ball: BallState,
  rect: Rect,
): { ball: BallState; face: HitFace | null } {
  const inside =
    ball.x > rect.x0 - BALL_R &&
    ball.x < rect.x1 + BALL_R &&
    ball.y > rect.y0 - BALL_R &&
    ball.y < rect.y1 + BALL_R;
  if (!inside) return { ball, face: null };

  const depths = [
    { face: "left" as const, value: ball.x - (rect.x0 - BALL_R) },
    { face: "right" as const, value: rect.x1 + BALL_R - ball.x },
    { face: "top" as const, value: ball.y - (rect.y0 - BALL_R) },
    { face: "bottom" as const, value: rect.y1 + BALL_R - ball.y },
  ];
  const face = depths.reduce((best, next) =>
    next.value < best.value ? next : best,
  ).face;
  let { x, y, vx, vy } = ball;
  if (face === "left") {
    x = rect.x0 - BALL_R;
    if (vx > 0) vx = -vx;
  } else if (face === "right") {
    x = rect.x1 + BALL_R;
    if (vx < 0) vx = -vx;
  } else if (face === "top") {
    y = rect.y0 - BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = rect.y1 + BALL_R;
    if (vy < 0) vy = -vy;
  }
  return { ball: { ...ball, x, y, vx, vy }, face };
}

function paddleBounce(
  ball: BallState,
  side: Side,
  paddle: DeepReadonly<PaddleState>,
): BallState {
  const speed = Math.min(Math.hypot(ball.vx, ball.vy) * SPEED_MULT, SPEED_CAP);
  const offset = clamp((ball.y - paddle.cy) / PADDLE_HALF, -1, 1);
  const theta = offset * MAX_BOUNCE_ANGLE;
  const dir = side === "left" ? 1 : -1;
  return {
    ...ball,
    x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
    vx: dir * speed * Math.cos(theta),
    vy: speed * Math.sin(theta),
    spin: clamp(
      ball.spin + paddle.vy * SPIN_FROM_PADDLE,
      -SPIN_CLAMP,
      SPIN_CLAMP,
    ),
  };
}

function rotateVelocity(ball: BallState, h: number): BallState {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed <= 0) return ball;
  const angle = (ball.spin / speed) * h;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    ...ball,
    vx: ball.vx * cos - ball.vy * sin,
    vy: ball.vx * sin + ball.vy * cos,
  };
}

function stepBall(
  ball: BallState,
  state: DeepReadonly<CaromState>,
  dt: number,
): { ball: BallState; events: ReadonlySet<CollisionKind> } {
  const events = new Set<CollisionKind>();
  const speed = Math.hypot(ball.vx, ball.vy);
  const steps = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP));
  const h = dt / steps;
  let next = ball;

  for (let i = 0; i < steps; i += 1) {
    next = rotateVelocity(next, h);
    next = {
      ...next,
      spin: next.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
      x: next.x + next.vx * h,
      y: next.y + next.vy * h,
    };

    if (next.y - BALL_R < 0 && next.vy < 0) {
      next = { ...next, y: BALL_R, vy: -next.vy };
      events.add("wall");
    } else if (next.y + BALL_R > FIELD_H && next.vy > 0) {
      next = { ...next, y: FIELD_H - BALL_R, vy: -next.vy };
      events.add("wall");
    }

    const left = collideCircleRect(
      next,
      rectForPaddle("left", state.paddles.left.cy),
    );
    if (left.face) {
      next =
        left.face === "left" || left.face === "right"
          ? paddleBounce(left.ball, "left", state.paddles.left)
          : left.ball;
      events.add(
        left.face === "left" || left.face === "right" ? "paddle" : "wall",
      );
    }

    const right = collideCircleRect(
      next,
      rectForPaddle("right", state.paddles.right.cy),
    );
    if (right.face) {
      next =
        right.face === "left" || right.face === "right"
          ? paddleBounce(right.ball, "right", state.paddles.right)
          : right.ball;
      events.add(
        right.face === "left" || right.face === "right" ? "paddle" : "wall",
      );
    }

    for (const obstacle of state.obstacles) {
      const rect = OBSTACLES[obstacle.index];
      if (!rect) continue;
      const hit = collideCircleRect(next, rect);
      if (hit.face) {
        next = hit.ball;
        events.add("obstacle");
      }
    }
  }
  return { ball: next, events };
}

function appendTrail(ball: BallState, simTime: number): BallState {
  const trail = [...ball.trail, { x: ball.x, y: ball.y, t: simTime }].filter(
    (sample) => simTime - sample.t <= TRAIL_TIME,
  );
  return { ...ball, trail };
}

function serve(ball: BallState, receiver: Side): BallState {
  const dir = receiver === "left" ? -1 : 1;
  return {
    ...ball,
    held: false,
    holdTimer: 0,
    trail: [],
    vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
    vy: ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
  };
}

function scoreAfterPoint(
  state: CaromState,
  scorer: Side,
  ball: BallState,
): CaromState {
  const score = {
    p1: state.score.p1 + (scorer === "left" ? 1 : 0),
    p2: state.score.p2 + (scorer === "right" ? 1 : 0),
  };
  const leftWins = score.p1 >= WIN_SCORE && score.p1 - score.p2 >= WIN_LEAD;
  const rightWins = score.p2 >= WIN_SCORE && score.p2 - score.p1 >= WIN_LEAD;
  if (leftWins || rightWins) {
    return {
      ...state,
      score,
      winner: leftWins ? "left" : "right",
      screen: "matchover",
      menuIndex: 0,
      ball,
    };
  }
  return {
    ...state,
    score,
    receiver: scorer === "left" ? "right" : "left",
    ball: parkedBall(),
    screen: "countdown",
  };
}

function advanceCountdownOrPlay(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
  dt: number,
  simTime: number,
): CaromState {
  let next = movePaddles(state, api, dt);
  if (!next.ball) return { ...next, simTime };

  if (next.screen === "countdown") {
    const holdTimer = Math.max(0, next.ball.holdTimer - dt);
    let ball = { ...next.ball, x: FIELD_CX, y: FIELD_CY, holdTimer };
    if (holdTimer <= 0) {
      ball = serve(ball, next.receiver);
      next = { ...next, screen: "playing", ball, simTime };
      return next;
    }
    return { ...next, ball: appendTrail(ball, simTime), simTime };
  }

  const stepped = stepBall(next.ball, next, dt);
  for (const event of stepped.events) {
    if (event === "paddle") api.audio.play(CUES.paddleHit);
    if (event === "wall") api.audio.play(CUES.wallBounce);
    if (event === "obstacle") api.audio.play(CUES.obstacleBounce);
  }
  const ball = appendTrail(stepped.ball, simTime);
  next = { ...next, ball, simTime };
  if (ball.x - BALL_R > FIELD_W) {
    api.audio.play(CUES.score);
    return scoreAfterPoint(next, "left", ball);
  }
  if (ball.x + BALL_R < 0) {
    api.audio.play(CUES.score);
    return scoreAfterPoint(next, "right", ball);
  }
  return next;
}

function readInput(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
): CaromState {
  let next = cloneState(state);
  const startedScreen = state.screen;

  if (api.input.pressed("mute")) {
    api.audio.setMuted(!api.audio.muted());
    next = { ...next, muted: api.audio.muted() };
  }

  if (startedScreen === "countdown" || startedScreen === "playing") {
    if (api.input.pressed("pause")) {
      return {
        ...next,
        screen: "paused",
        resumeScreen: startedScreen,
        menuIndex: 0,
      };
    }
    return next;
  }

  if (startedScreen === "paused") {
    if (api.input.pressed("pause") || api.input.pressed("back")) {
      return {
        ...next,
        screen: state.resumeScreen,
      };
    }
  } else if (startedScreen === "howto") {
    if (api.input.pressed("confirm") || api.input.pressed("back")) {
      return returnToTitle(next);
    }
  } else if (startedScreen === "matchover" && api.input.pressed("back")) {
    return returnToTitle(next);
  } else {
    api.input.pressed("back");
  }

  const count = menuLength(startedScreen);
  if (count > 0) {
    const up = api.input.pressed("p1-up") || api.input.pressed("p2-up");
    const down =
      !up && (api.input.pressed("p1-down") || api.input.pressed("p2-down"));
    if (up || down) {
      next = {
        ...next,
        menuIndex: wrapMenu(next.menuIndex, count, up ? -1 : 1),
      };
    } else if (api.input.pressed("confirm")) {
      return confirmMenu(next, next.menuIndex);
    }
  }

  return applyPointerMenu(next, api);
}

function applyPointerMenu(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
): CaromState {
  if (menuLength(state.screen) === 0) return cloneState(state);
  let next = cloneState(state);
  const pointer = api.input.pointer();
  const hover = rectIndexAt(next, pointer.x, pointer.y);
  if (hover !== null) next = { ...next, menuIndex: hover };

  const samples = api.input.pointerSamples();
  for (const sample of samples) {
    const index = rectIndexAt(next, sample.x, sample.y);
    if (index !== null) next = { ...next, menuIndex: index };
    if (sample.type === "up" && index !== null) {
      return confirmMenu({ ...next, menuIndex: index }, index);
    }
  }

  api.input.pointerPressed();
  if (api.input.pointerReleased() && hover !== null) {
    return confirmMenu({ ...next, menuIndex: hover }, hover);
  }
  return next;
}

function syncMuted(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
): CaromState {
  if (state.muted !== api.audio.muted()) api.audio.setMuted(state.muted);
  return { ...cloneState(state), muted: api.audio.muted() };
}

function setBall(
  state: DeepReadonly<CaromState>,
  updater: (ball: DeepReadonly<BallState>) => BallState,
): CaromState {
  if (!state.ball) throw new Error("Carom: no ball is present");
  return { ...cloneState(state), ball: updater(state.ball) };
}

function buildDebug(): CaromDebugApi {
  return {
    version: CAROM_DEBUG_VERSION,
    clearWorld: (state) => ({
      ...cloneState(state),
      ball: null,
      obstacles: [],
    }),
    spawnBall: (state) => ({ ...cloneState(state), ball: parkedBall() }),
    spawnObstacle: (state, index) => {
      const center = OBSTACLE_CENTERS[index];
      if (!center) throw new Error(`Carom: no obstacle ${index}`);
      return {
        ...cloneState(state),
        obstacles: [
          ...state.obstacles.filter((obstacle) => obstacle.index !== index),
          { index, cx: center.x, cy: center.y },
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (state) => titleState(state.muted),
    reconcile: (state) => cloneState(state),
    setScreen: (state, screen) => ({ ...cloneState(state), screen }),
    setMode: (state, mode) => ({ ...cloneState(state), mode }),
    setMenuIndex: (state, index) => ({
      ...cloneState(state),
      menuIndex: index,
    }),
    setTitleIndex: (state, index) => ({
      ...cloneState(state),
      titleIndex: index,
    }),
    setResumeScreen: (state, screen) => ({
      ...cloneState(state),
      resumeScreen: screen,
    }),
    setScore: (state, p1, p2) => ({ ...cloneState(state), score: { p1, p2 } }),
    setWinner: (state, winner) => ({ ...cloneState(state), winner }),
    setReceiver: (state, receiver) => ({ ...cloneState(state), receiver }),
    setPaddleCy: (state, side, cy) => ({
      ...cloneState(state),
      paddles: {
        ...cloneState(state).paddles,
        [side]: { ...state.paddles[side], cy },
      },
    }),
    setPaddleVy: (state, side, vy) => ({
      ...cloneState(state),
      paddles: {
        ...cloneState(state).paddles,
        [side]: { ...state.paddles[side], drivenVy: vy },
      },
    }),
    setPaddleDriven: (state, side, driven) => ({
      ...cloneState(state),
      paddles: {
        ...cloneState(state).paddles,
        [side]: { ...state.paddles[side], driven },
      },
    }),
    setBallPosition: (state, x, y) =>
      setBall(state, (ball) => ({ ...ball, x, y })),
    setBallVelocity: (state, vx, vy) =>
      setBall(state, (ball) => ({ ...ball, vx, vy })),
    setBallSpin: (state, spin) => setBall(state, (ball) => ({ ...ball, spin })),
    setBallHeld: (state, held) => setBall(state, (ball) => ({ ...ball, held })),
    setBallHoldTimer: (state, holdTimer) =>
      setBall(state, (ball) => ({ ...ball, holdTimer })),
    setBallServeSign: (state, serveSign) =>
      setBall(state, (ball) => ({ ...ball, serveSign })),
    drawBallServeSign: (state) =>
      setBall(state, (ball) => ({ ...ball, serveSign: drawServeSign() })),
    setAiTracking: (state, tracking) => ({
      ...cloneState(state),
      ai: { ...state.ai, tracking },
    }),
    setAiMovement: (state, movement) => ({
      ...cloneState(state),
      ai: { ...state.ai, movement },
    }),
    setMuted: (state, muted) => ({ ...cloneState(state), muted }),
    snapshot: (state) => ({
      version: CAROM_DEBUG_VERSION,
      screen: state.screen,
      mode: state.mode,
      menuIndex: state.menuIndex,
      titleIndex: state.titleIndex,
      resumeScreen: state.resumeScreen,
      score: { p1: state.score.p1, p2: state.score.p2 },
      winner: state.winner,
      muted: state.muted,
      paddles: {
        left: { ...state.paddles.left },
        right: { ...state.paddles.right },
      },
      ai: { ...state.ai },
      receiver: state.receiver,
      ball: state.ball
        ? { ...state.ball, speed: Math.hypot(state.ball.vx, state.ball.vy) }
        : null,
      obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
      simTime: state.simTime,
    }),
    menuItemRect,
  };
}

function registerDiagnostics(api: InitApi<CaromState>): void {
  api.diagnostics.register("screen", (state) => state.screen);
  api.diagnostics.register("mode", (state) => state.mode);
  api.diagnostics.register(
    "score",
    (state) => `${state.score.p1}-${state.score.p2}`,
  );
  api.diagnostics.register("ball", (state) =>
    state.ball
      ? `${state.ball.x.toFixed(0)},${state.ball.y.toFixed(0)}`
      : "none",
  );
  api.diagnostics.register("ball velocity", (state) =>
    state.ball
      ? `${state.ball.vx.toFixed(0)},${state.ball.vy.toFixed(0)}`
      : "none",
  );
  api.diagnostics.register("ball speed", (state) =>
    state.ball ? Math.hypot(state.ball.vx, state.ball.vy).toFixed(0) : "none",
  );
  api.diagnostics.register("spin", (state) =>
    state.ball ? state.ball.spin.toFixed(0) : "none",
  );
  api.diagnostics.register(
    "left paddle",
    (state) =>
      `${state.paddles.left.cy.toFixed(0)},${state.paddles.left.vy.toFixed(0)}`,
  );
  api.diagnostics.register(
    "right paddle",
    (state) =>
      `${state.paddles.right.cy.toFixed(0)},${state.paddles.right.vy.toFixed(0)}`,
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawField(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = FIELD_FILL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);

  ctx.strokeStyle = "rgba(238, 247, 255, 0.24)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 18]);
  ctx.beginPath();
  ctx.moveTo(NET_X, 34);
  ctx.lineTo(NET_X, FIELD_H - 34);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const obstacle of state.obstacles) {
    ctx.fillStyle = OBSTACLE_FILL;
    ctx.shadowColor = "rgba(66, 245, 155, 0.35)";
    ctx.shadowBlur = 18;
    roundRect(
      ctx,
      obstacle.cx - OBSTACLE_HW,
      obstacle.cy - OBSTACLE_HH,
      OBSTACLE_W,
      OBSTACLE_H,
      10,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawPaddle(ctx, "left", state.paddles.left.cy);
  drawPaddle(ctx, "right", state.paddles.right.cy);
  if (state.ball) drawBall(ctx, state.ball);
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  side: Side,
  cy: number,
): void {
  const x = side === "left" ? P1_X0 : P2_X0;
  ctx.fillStyle = side === "left" ? P1_FILL : P2_FILL;
  ctx.shadowColor =
    side === "left" ? "rgba(54, 214, 255, 0.45)" : "rgba(255, 92, 138, 0.45)";
  ctx.shadowBlur = 16;
  roundRect(ctx, x, cy - PADDLE_HALF, PADDLE_W, PADDLE_H, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: DeepReadonly<BallState>,
): void {
  if (ball.trail.length > 1) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < ball.trail.length; i += 1) {
      const prev = ball.trail[i - 1];
      const curr = ball.trail[i];
      ctx.strokeStyle = `rgba(249, 248, 113, ${0.12 + (i / ball.trail.length) * 0.5})`;
      ctx.lineWidth = BALL_R * (0.45 + i / ball.trail.length);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
  }
  ctx.fillStyle = BALL_FILL;
  ctx.shadowColor = "rgba(249, 248, 113, 0.55)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawHud(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = TEXT_FILL;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "700 54px Inter, system-ui, sans-serif";
  ctx.fillText(String(state.score.p1), FIELD_CX - 105, 24);
  ctx.fillText(String(state.score.p2), FIELD_CX + 105, 24);
  ctx.font = "700 16px Inter, system-ui, sans-serif";
  ctx.fillStyle = DIM_TEXT;
  ctx.fillText(
    state.mode === "solo" ? "SOLO DUEL" : "VERSUS DUEL",
    FIELD_CX,
    92,
  );
  if (state.screen === "countdown" && state.ball) {
    ctx.font = "800 72px Inter, system-ui, sans-serif";
    ctx.fillStyle = MENU_FILL;
    ctx.fillText(Math.ceil(state.ball.holdTimer).toString(), FIELD_CX, 296);
  }
}

function drawMenuItems(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
  labels: readonly string[],
): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  labels.forEach((label, index) => {
    const rect = menuItemRect(state, index);
    if (!rect) return;
    const active = index === state.menuIndex;
    ctx.fillStyle = active
      ? "rgba(249, 248, 113, 0.16)"
      : "rgba(238, 247, 255, 0.06)";
    ctx.strokeStyle = active ? MENU_FILL : "rgba(238, 247, 255, 0.18)";
    ctx.lineWidth = active ? 3 : 1.5;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = active ? MENU_FILL : TEXT_FILL;
    ctx.font = "800 24px Inter, system-ui, sans-serif";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  });
}

function drawTitle(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = PANEL_FILL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = SHADOW;
  ctx.shadowBlur = 24;
  ctx.fillStyle = TEXT_FILL;
  ctx.font = "900 118px Inter, system-ui, sans-serif";
  ctx.fillText(TITLE_TEXT, FIELD_CX, 205);
  ctx.shadowBlur = 0;
  ctx.fillStyle = DIM_TEXT;
  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillText("Curve the rally. Find the bank.", FIELD_CX, 285);
  drawMenuItems(state, ctx, TITLE_ITEMS);
}

function drawHowTo(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = PANEL_FILL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = TEXT_FILL;
  ctx.font = "800 54px Inter, system-ui, sans-serif";
  ctx.fillText("HOW TO PLAY", FIELD_CX, 92);
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#cfe5f4";
  const lines = [
    "Left paddle: W / S. Right paddle: Arrow Up / Arrow Down.",
    "In Solo, either set of movement keys drives the left paddle.",
    "Hit while moving to bend the ball with spin after contact.",
    "Use the center posts for banks. First to 11, win by 2.",
    "P pauses. M mutes.",
  ];
  lines.forEach((line, index) =>
    ctx.fillText(line, FIELD_CX, 190 + index * 56),
  );
  drawMenuItems({ ...state, menuIndex: 0 }, ctx, ["BACK"]);
}

function drawPause(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = PANEL_FILL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TEXT_FILL;
  ctx.font = "900 64px Inter, system-ui, sans-serif";
  ctx.fillText("PAUSED", FIELD_CX, 245);
  drawMenuItems(state, ctx, PAUSE_ITEMS);
}

function drawMatchOver(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = PANEL_FILL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TEXT_FILL;
  ctx.font = "900 58px Inter, system-ui, sans-serif";
  const winner =
    state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS";
  ctx.fillText(winner, FIELD_CX, 230);
  ctx.fillStyle = DIM_TEXT;
  ctx.font = "700 34px Inter, system-ui, sans-serif";
  ctx.fillText(`${state.score.p1} - ${state.score.p2}`, FIELD_CX, 305);
  drawMenuItems(state, ctx, MATCHOVER_ITEMS);
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const action of ACTIONS) {
      api.input.register(action, { keys: [...BINDINGS[action]] });
    }
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 520,
      freqTo: 270,
      gain: 0.16,
      durationMs: 56,
    });
    api.audio.define(CUES.wallBounce, {
      wave: "sine",
      freq: 320,
      freqTo: 190,
      gain: 0.14,
      durationMs: 50,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "triangle",
      freq: 760,
      freqTo: 380,
      gain: 0.15,
      durationMs: 70,
    });
    api.audio.define(CUES.score, {
      wave: "sawtooth",
      freq: 210,
      freqTo: 620,
      gain: 0.16,
      durationMs: 150,
    });
    registerDiagnostics(api);
    return [titleState(false), buildDebug()];
  },

  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    let next = syncMuted(state, api);
    const startedScreen = next.screen;
    next = readInput(next, api);
    const simTime = next.simTime + dt;

    if (startedScreen !== next.screen) {
      return { ...next, simTime, muted: api.audio.muted() };
    }
    if (next.screen === "countdown" || next.screen === "playing") {
      return {
        ...advanceCountdownOrPlay(next, api, dt, simTime),
        muted: api.audio.muted(),
      };
    }
    return { ...next, simTime, muted: api.audio.muted() };
  },

  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const { ctx } = api;
    drawField(state, ctx);
    if (
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover"
    ) {
      drawHud(state, ctx);
    }
    if (state.screen === "title") drawTitle(state, ctx);
    if (state.screen === "howto") drawHowTo(state, ctx);
    if (state.screen === "paused") drawPause(state, ctx);
    if (state.screen === "matchover") drawMatchOver(state, ctx);
  },
};
