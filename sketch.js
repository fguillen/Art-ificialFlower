let points;

function setup() {
  createCanvas(400, 400);
  points = new Array(4);

  points[0] = createVector(5, 26);
  points[1] = createVector(73, 24);
  points[2] = createVector(73, 61);
  points[3] = createVector(15, 65);
}

function draw() {
  background(220);

  noFill();
  stroke(255, 102, 0);
  curve(points[0].x, points[0].y, points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
  stroke(0);
  curve(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
  stroke(255, 102, 0);
  curve(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y, points[3].x, points[3].y);
}
