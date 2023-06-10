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

    // if (this.#connections.length > 1) {
    //   ctx.lineWidth = 2;
    //   ctx.strokeStyle = "lightgreen";
    //   const right = this.#pos
    //     .copy()
    //     .add(new Vector(150, 0).setAngle(nodeOrientation));
    //   ctx.moveTo(this.#pos.x, this.#pos.y);
    //   ctx.lineTo(right.x, right.y);
    //   ctx.stroke();
    // }

    ctx.lineWidth = 3;
    for (const connection of this.#connections) {
      const posDiff = connection.node.#pos.copy().sub(this.#pos);
      if (!connection.foreign) {
        const radiusRestoringVec = posDiff
          .copy()
          .setMagnitude(posDiff.getMagnitude() - connection.radius)
          .multiply(connection.radiusRestoringStrength / 2);

        // ctx.strokeStyle = "blue";
        // ctx.moveTo(this.#pos.x, this.#pos.y);
        // ctx.lineTo(
        //   this.#pos.x + radiusRestoringVec.x,
        //   this.#pos.y + radiusRestoringVec.y
        // );
        // ctx.stroke();
        // ctx.moveTo(connection.node.#pos.x, connection.node.#pos.y);
        // ctx.lineTo(
        //   connection.node.#pos.x - radiusRestoringVec.x,
        //   connection.node.#pos.y - radiusRestoringVec.y
        // );
        // ctx.stroke();

        this.addAccel(radiusRestoringVec);
        connection.node.addAccel(radiusRestoringVec.multiply(-1));
      }
      // if (this.#connections.length > 1) {
      //   const bearingDiff = angleMod(
      //     posDiff.getAngle() + connection.desiredBearing - nodeOrientation
      //   );
      //   // Bearing restoring force is **always** perpendicular to the radius restoring force
      //   const bearingRestoringForce = new Vector(
      //     -posDiff.y,
      //     posDiff.x
      //   ).setMagnitude(bearingDiff * connection.bearingRestoringStrength * 3);

      //   // ctx.strokeStyle = "yellow";
      //   // ctx.moveTo(this.#pos.x, this.#pos.y);
      //   // ctx.lineTo(
      //   //   this.#pos.x + bearingRestoringForce.x,
      //   //   this.#pos.y + bearingRestoringForce.y
      //   // );
      //   // ctx.stroke();

      //   this.addAccel(bearingRestoringForce);
      //   connection.node.addAccel(bearingRestoringForce.multiply(-1));
      // }
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

        // ctx.strokeStyle = "yellow";
        // ctx.moveTo(this.#pos.x, this.#pos.y);
        // ctx.lineTo(
        //   this.#pos.x + bearingRestoringForce.x,
        //   this.#pos.y + bearingRestoringForce.y
        // );
        // ctx.stroke();

        this.addAccel(bearingRestoringForce);
        connection.node.addAccel(bearingRestoringForce.multiply(-1));
      }
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
  }

  // calcUpdates() {
  //   if (this.#connections.length < 1) return;

  //   const nodeOrientation = Vector.ZERO.add(
  //     ...this.#connections.map(({ desiredBearing, node }) =>
  //       Vector.RIGHT.setAngle(
  //         node.#pos.copy().sub(this.#pos).getAngle() - desiredBearing
  //       )
  //     )
  //   ).normalise();
  //   /*
  //   (4, 0) - Math.PI/2 = 0, -1
  //   (0, -5) - Math.PI = 0, -1

  //   (4, 0) - (0, -1) = (1, 1)
  //   (0, -5) - (-1, 0) = (1, -1)

  //   avg = 0, -1

  //   desired = (0, -1) - (0, -1) + (4, 0) = (4, 0)

  //   */
  //   // const nodeOrientation = Vector.RIGHT.setAngle(
  //   //   this.#connections.reduce(
  //   //     (acc, { desiredBearing, node }) =>
  //   //       acc +
  //   //       Math.acos(
  //   //         node.#pos
  //   //           .copy()
  //   //           .sub(this.#pos)
  //   //           .normalise()
  //   //           .dot(Vector.RIGHT.setAngle(desiredBearing))
  //   //       ),
  //   //     0
  //   //   ) / this.#connections.length
  //   // );

  //   // if (this.#connections.length > 1) {
  //   //   ctx.lineWidth = 2;
  //   //   ctx.strokeStyle = "lightgreen";
  //   //   const right = this.#pos.copy().add(nodeOrientation.copy().multiply(150));
  //   //   ctx.moveTo(this.#pos.x, this.#pos.y);
  //   //   ctx.lineTo(right.x, right.y);
  //   //   ctx.stroke();
  //   // }

  //   ctx.lineWidth = 3;
  //   for (const connection of this.#connections) {
  //     const posDiff = connection.node.#pos.copy().sub(this.#pos);
  //     if (!connection.foreign) {
  //       const radiusRestoringVec = posDiff
  //         .copy()
  //         .setMagnitude(posDiff.getMagnitude() - connection.radius)
  //         .multiply(connection.radiusRestoringStrength / 2);

  //       // ctx.strokeStyle = "blue";
  //       // ctx.moveTo(this.#pos.x, this.#pos.y);
  //       // ctx.lineTo(
  //       //   this.#pos.x + radiusRestoringVec.x,
  //       //   this.#pos.y + radiusRestoringVec.y
  //       // );
  //       // ctx.stroke();
  //       // ctx.moveTo(connection.node.#pos.x, connection.node.#pos.y);
  //       // ctx.lineTo(
  //       //   connection.node.#pos.x - radiusRestoringVec.x,
  //       //   connection.node.#pos.y - radiusRestoringVec.y
  //       // );
  //       // ctx.stroke();

  //       this.addAccel(radiusRestoringVec);
  //       connection.node.addAccel(radiusRestoringVec.multiply(-1));
  //     }
  //     if (this.#connections.length > 1) {
  //       // const bearingDiff = posDiff
  //       //   .getNorm()
  //       //   .sub(Vector.RIGHT.setAngle(connection.desiredBearing))
  //       //   .add(nodeOrientation);
  //       const bearingDiff = Vector.RIGHT.setAngle(connection.desiredBearing)
  //         .sub(nodeOrientation)
  //         .add(posDiff.getNorm());
  //       // Bearing restoring force is **always** perpendicular to the radius restoring force
  //       // const bearingRestoringForce = new Vector(
  //       //   -posDiff.y,
  //       //   posDiff.x
  //       // ).multiply(
  //       //   bearingDiff.getMagnitude() * connection.bearingRestoringStrength
  //       // );
  //       const forceAxis = new Vector(-posDiff.y, posDiff.x);
  //       // const bearingRestoringForce = forceAxis.multiply(
  //       //   (forceAxis.dot(bearingDiff) >= 0 ? 1 : -1) *
  //       //     bearingDiff.getMagnitude() *
  //       //     connection.bearingRestoringStrength
  //       // );

  //       const bearingRestoringForce = forceAxis.multiply(
  //         forceAxis.getNorm().dot(bearingDiff) *
  //           connection.bearingRestoringStrength
  //       );

  //       ctx.strokeStyle = "yellow";
  //       ctx.moveTo(this.#pos.x, this.#pos.y);
  //       ctx.lineTo(
  //         this.#pos.x + bearingRestoringForce.x,
  //         this.#pos.y + bearingRestoringForce.y
  //       );
  //       ctx.stroke();

  //       this.addAccel(bearingRestoringForce);
  //       connection.node.addAccel(bearingRestoringForce.multiply(-1));
  //     }
  //   }

  //   ctx.strokeStyle = "white";
  //   ctx.lineWidth = 5;
  // }

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
