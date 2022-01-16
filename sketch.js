let points;
let pointsIndex;
let resetAt;

function setup() {
  createCanvas(800, 800);
  points = new Array(5);

  points[0] = createVector(5, 26);
  points[1] = createVector(73, 24);
  points[2] = createVector(73, 61);
  points[3] = createVector(15, 65);
  points[4] = createVector(10, 65);

  pointsIndex = 0;
  resetTime();
}

function draw() {
  background(220);

  strokeWeight(5);
  point(points[0].x, points[0].y);
  point(points[1].x, points[1].y);
  point(points[2].x, points[2].y);
  point(points[3].x, points[3].y);
  point(points[4].x, points[4].y);
  strokeWeight(1);

  noFill();
  beginShape();
  curveVertex(points[4].x, points[4].y);
  curveVertex(points[0].x, points[0].y);
  curveVertex(points[1].x, points[1].y);
  curveVertex(points[2].x, points[2].y);
  curveVertex(points[3].x, points[3].y);
  curveVertex(points[4].x, points[4].y);
  curveVertex(points[0].x, points[0].y);
  curveVertex(points[1].x, points[1].y);

  endShape();

  if(Date.now() > resetAt) {
    resetPoints();
  }
}

function resetPoints() {
  pointsIndex = 0;
  resetTime();
}

function resetTime() {
  resetAt = Date.now() + 2_000;
  console.log("resetTime()");
}

function mouseClicked() {
  points[pointsIndex % points.length] = createVector(mouseX, mouseY);
  pointsIndex ++;
  resetTime();
}
