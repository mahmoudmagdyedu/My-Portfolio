/* ──────────────────────────────────────────────
   Countdown Timer
   ────────────────────────────────────────────── */

class CountdownTimer {
  private remaining: number;
  private intervalId: number | null = null;
  private onTick: (seconds: number) => void;
  private onExpire: () => void;

  constructor(
    seconds: number,
    onTick: (seconds: number) => void,
    onExpire: () => void
  ) {
    this.remaining = seconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
  }

  start(): void {
    this.onTick(this.remaining);
    this.intervalId = window.setInterval(() => {
      this.remaining--;
      this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        this.onExpire();
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getRemaining(): number {
    return this.remaining;
  }
}
