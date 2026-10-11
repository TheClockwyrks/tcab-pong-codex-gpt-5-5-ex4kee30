import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { BALL_R, FIELD_CY, FIELD_H, FIELD_W, P1_X1 } from "./constants";
import { game } from "./game";

function makeEngine() {
  const target = new EventTarget();
  const canvas = createCanvas(FIELD_W, FIELD_H) as unknown as HTMLCanvasElement;
  return createEngine({
    canvas,
    width: FIELD_W,
    height: FIELD_H,
    game,
    clock: new ConstantClock(1000 / 60),
    surface: {
      cssWidth: () => FIELD_W,
      cssHeight: () => FIELD_H,
      dpr: () => 1,
      events: () => target,
    },
    background: "#07111c",
    layout: "dual-vertical",
  });
}

describe("Carom simulation", () => {
  it("initializes with a complete title-screen snapshot", async () => {
    const engine = makeEngine();
    await engine.initialize();

    const snapshot = engine.debug.snapshot(engine.state);

    expect(snapshot.screen).toBe("title");
    expect(snapshot.mode).toBe("solo");
    expect(snapshot.score).toEqual({ p1: 0, p2: 0 });
    expect(snapshot.ball?.held).toBe(true);
    expect(snapshot.obstacles).toHaveLength(2);
    expect(engine.debug.menuItemRect(engine.state, 0)).not.toBeNull();
  });

  it("serves toward the receiver when the hold expires", async () => {
    const engine = makeEngine();
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "countdown"));
    engine.apply((state) => engine.debug.setBallHoldTimer(state, 0));
    engine.apply((state) => engine.debug.setBallServeSign(state, 1));

    await engine.advance(1);
    const snapshot = engine.debug.snapshot(engine.state);

    expect(snapshot.screen).toBe("playing");
    expect(snapshot.ball?.held).toBe(false);
    expect(snapshot.ball?.vx).toBeLessThan(0);
    expect(snapshot.ball?.vy).toBeGreaterThan(0);
    expect(snapshot.ball?.x).toBe(FIELD_W / 2);
  });

  it("adds paddle spin from the paddle's integrated velocity", async () => {
    const engine = makeEngine();
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, P1_X1 + BALL_R + 1, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, -300, 0));
    engine.apply((state) => engine.debug.setPaddleDriven(state, "left", true));
    engine.apply((state) => engine.debug.setPaddleVy(state, "left", 720));

    await engine.advance(1);
    const snapshot = engine.debug.snapshot(engine.state);

    expect(snapshot.ball?.vx).toBeGreaterThan(0);
    expect(snapshot.ball?.spin).toBeGreaterThan(0);
    expect(snapshot.paddles.left.vy).toBeGreaterThan(0);
  });

  it("scores and ends a match when the win rule is met", async () => {
    const engine = makeEngine();
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) => engine.debug.setScore(state, 10, 9));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, FIELD_W + BALL_R + 2, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, 0, 0));

    await engine.advance(1);
    const snapshot = engine.debug.snapshot(engine.state);

    expect(snapshot.score).toEqual({ p1: 11, p2: 9 });
    expect(snapshot.winner).toBe("left");
    expect(snapshot.screen).toBe("matchover");
  });
});
