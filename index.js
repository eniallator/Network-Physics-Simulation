ctx.fillStyle = "black";
ctx.strokeStyle = "white";
ctx.lineWidth = 5;

// const system = new Array(10)
//   .fill()
//   .map((_, i) => new Node(200 + 100 * i, 100 + i ** 2 * 20));
// const system = new Array(10).fill().map((_, i) => new Node(200 + 100 * i, 600));
// const system = [
//   new Node(400, 400),
//   new Node(500, 400),
//   new Node(500, 500),
//   new Node(400, 400),
//   new Node(300, 400),
//   new Node(400, 400),
//   new Node(500, 400),
//   new Node(400, 600),
// ];
// const system = [new Node(400, 400), new Node(430, 370), new Node(460, 400)];
// const system = [new Node(400, 395), new Node(430, 400), new Node(460, 395)];
const system = [
  new Node(400, 400),
  new Node(430, 401),
  new Node(460, 403),
  new Node(490, 406),
  new Node(520, 410),
  new Node(550, 415),
  new Node(580, 421),
  new Node(610, 428),
  new Node(640, 436),
  new Node(670, 445),
  new Node(700, 455),
];
const n = system.length;
system.forEach(
  (node, i, arr) =>
    i > 0 &&
    node.addConnection(
      arr[i - 1],
      100,
      0,
      Math.PI - (2 * Math.PI) / (n - 1),
      300,
      50
    )
  // node.addConnection(arr[i - 1], 100, 0, Math.PI, 50, 2)
  // node.addConnection(arr[i - 1], 100, 0, Math.PI / 2, 50, 5)
);

let lastDraw;

function draw() {
  const now = new Date().getTime();
  const dt = Math.min(((lastDraw ?? now) - now) / 1000, 100);
  lastDraw = now;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  system.forEach((node) => node.calcUpdates());
  system.forEach((node) => node.update(dt));

  ctx.beginPath();
  for (const node of system) {
    ctx.lineTo(node.pos.x, node.pos.y);
  }
  ctx.stroke();

  requestAnimationFrame(draw);
}

window.resizeCallback = draw;

paramConfig.onLoad(draw);
