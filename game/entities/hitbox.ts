export class AttackHitbox {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public duration: number
  ) {}

  update(delta: number) {
    this.duration -= delta;

    return this.duration <= 0;
  }
}
