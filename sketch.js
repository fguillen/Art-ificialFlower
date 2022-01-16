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
  noLoop();
}

function draw() {
  background(220);

  drawCurve();
}

function drawCurveMouse(){
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

function drawCurve(){
  let steps = 20
  let angleStep = TWO_PI / steps;
  let x = width/2;
  let y = height/2;
  let radio = 200;
  let curvePoints = new Array(steps);
  let index = 0;


  // calculate points
  for (let i = 0; i < TWO_PI; i += angleStep) {
		let sx = x + cos(i) * radio;
		let sy = y + sin(i) * radio;

    curvePoints[index] = createVector(sx, sy);
    index ++;
  }

  // Draw curve
  noFill();
  beginShape();
  curveVertex(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y);
  for (let i = 0; i < curvePoints.length; i++) {
    const p = curvePoints[i];
    strokeWeight(5);
    point(p.x, p.y);

    strokeWeight(1);
    curveVertex(p.x, p.y);

    console.log("x: " + p.x + ", y: " + p.y);
  }
  curveVertex(curvePoints[0].x, curvePoints[0].y);
  curveVertex(curvePoints[1].x, curvePoints[1].y);
  endShape();
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
