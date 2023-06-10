class Node {
  #pos;
  #lastPos;
  #connections;
  #accel;
  #isStuck;
  #energyLost = 0.97;

  constructor(xOrVec, y, isStuck = false) {
    this.#pos = new Vector(xOrVec, y);
    this.#lastPos = this.#pos.copy();
    this.#connections = [];
    this.#accel = Vector.ZERO;
    this.#isStuck = isStuck;
  }

  addConnection(
    node,
    radius,
    thisBearing,
    otherBearing,
    radiusRestoringStrength,
    bearingRestoringStrength
  ) {
    this.#connections.push({
      node,
      desiredBearing: thisBearing,
      radius,
      radiusRestoringStrength,
      bearingRestoringStrength:
        bearingRestoringStrength ?? radiusRestoringStrength,
      foreign: false,
    });
    node.#connections.push({
      node: this,
      desiredBearing: otherBearing,
      radius,
      radiusRestoringStrength,
      bearingRestoringStrength:
        bearingRestoringStrength ?? radiusRestoringStrength,
      foreign: true,
    });
  }

  addAccel(accelVec) {
    this.#accel.add(accelVec);
  }

  calcUpdates() {
    if (this.#connections.length < 1) return;
    const posMod = (a, b) => ((a % b) + b) % b;
    const angleMod = (theta) => posMod(theta + Math.PI, 2 * Math.PI) - Math.PI;

    const nodeOrientation = this.#connections.reduce(
      (acc, { desiredBearing, node }) =>
        acc +
        angleMod(desiredBearing - node.#pos.copy().sub(this.#pos).getAngle()) /
          this.#connections.length,
      0
    );

    for (const connection of this.#connections) {
      if (this.#isStuck && connection.node.#isStuck) continue;
      const posDiff = connection.node.#pos.copy().sub(this.#pos);
      const resultantRestoringForce = Vector.ZERO;
      if (!connection.foreign) {
        const radiusRestoringVec = posDiff
          .copy()
          .setMagnitude(posDiff.getMagnitude() - connection.radius)
          .multiply(connection.radiusRestoringStrength);

        resultantRestoringForce.add(radiusRestoringVec);
      }
      if (this.#connections.length > 1) {
        const bearingDiff = angleMod(
          nodeOrientation - connection.desiredBearing + posDiff.getAngle()
        );

        const bearingRestoringForce = posDiff
          .copy()
          .setAngle(posDiff.getAngle() + Math.PI / 2)
          .multiply(
            (bearingDiff / Math.PI) * connection.bearingRestoringStrength
          );

        resultantRestoringForce.add(bearingRestoringForce);
      }
      if (this.#isStuck) {
        connection.node.addAccel(resultantRestoringForce.multiply(-1));
      } else if (connection.node.#isStuck) {
        this.addAccel(resultantRestoringForce);
      } else {
        resultantRestoringForce.divide(2);
        this.addAccel(resultantRestoringForce);
        connection.node.addAccel(resultantRestoringForce.multiply(-1));
      }
    }
  }

  update(dt) {
    const vel = this.#pos.copy().sub(this.#lastPos);
    this.#lastPos.setHead(this.#pos);
    this.#pos.add(
      vel.add(this.#accel.multiply(dt * dt)).multiply(this.#energyLost)
    );
    this.#accel.setHead(0);
  }

  get pos() {
    return this.#pos;
  }
}
