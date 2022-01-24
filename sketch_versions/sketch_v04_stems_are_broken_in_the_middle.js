let points;
let pointsIndex;
let resetAt;
let petalsFormNoiseScale;
let petalsFormNoiseSpeed;
let petalsPositionNoiseScale;
let petalsPositionNoiseSpeed;
let blendModes;
let blendModeIndex;
let colorPetal;
let colorPetalSecondary;
let stemsPositionNoiseScale;
let stemsPositionNoiseSpeed;
let stemsMagnitudeNoiseScale;
let stemsMagnitudeNoiseSpeed;

function setup() {
  createCanvas(600, 600);
  frameRate(20);
  colorMode(HSB);

  points = new Array(5);

  points[0] = createVector(5, 26);
  points[1] = createVector(73, 24);
  points[2] = createVector(73, 61);
  points[3] = createVector(15, 65);
  points[4] = createVector(10, 65);

  pointsIndex = 0;
  petalsFormNoiseScale = 5;
  petalsFormNoiseSpeed = 0.01;
  petalsPositionNoiseScale = 50;
  petalsPositionNoiseSpeed = 0.005;
  stemsPositionNoiseScale = 50;
  stemsPositionNoiseSpeed = 0.005;
  stemsMagnitudeNoiseScale = 1;
  stemsMagnitudeNoiseSpeed = 0.005;
  colorPetal = color(222, 5, 82);
  colorPetalSecondary = color(hue(colorPetal), saturation(colorPetal), brightness(colorPetal) * 0.8);

  blendModes = [
    BLEND, DARKEST, LIGHTEST, DIFFERENCE, MULTIPLY, EXCLUSION, SCREEN, REPLACE, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN, ADD, REMOVE
  ]
  blendModeIndex = 0;

  // resetTime();
  // noLoop();
}

function draw() {
  background(255);

  drawPetals();
}

function drawPetals() {
  let numPetals = 30;
  let angleStep = TWO_PI / numPetals;
  let x = width / 2;
  let y = height / 2;
  let radio = (height / 2) - 50;

  for (let i = 0; i < TWO_PI; i += angleStep) {
		let sx = x + (cos(i) * radio);
		let sy = y + (sin(i) * radio);

    drawPetal(sx, sy, i * 1000);
  }
}

function drawPetal(x, y, noiseSeed) {
  colorMode(HSB);

  let noiseOffsetX = noise((frameCount * petalsPositionNoiseSpeed) + noiseSeed) * petalsPositionNoiseScale;
  let noiseOffsetY = noise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 1000) * petalsPositionNoiseScale;
  let noisedX = x + noiseOffsetX;
  let noisedY = y + noiseOffsetY;

  drawStem(noisedX, noisedY, noiseSeed);

  drawCurve(noisedX, noisedY, 0, colorPetal, BLEND, 20);
  drawCurve(noisedX, noisedY, 10000, colorPetalSecondary, BURN, 10);
}

function drawStem(x, y, noiseSeed) {
  let noiseOffsetX = noise((frameCount * stemsPositionNoiseSpeed) + noiseSeed) * stemsPositionNoiseScale;
  let noiseOffsetY = noise((frameCount * stemsPositionNoiseSpeed) + noiseSeed + 1000) * stemsPositionNoiseScale;

  let intermediateMagnitude = noise((frameCount * stemsMagnitudeNoiseSpeed) + noiseSeed + 2000) * stemsMagnitudeNoiseScale;
  let positionCenter = createVector(width / 2, height / 2);
  let positionPetal = createVector(x, y);
  let positionIntermediate = intermediatePosition(positionCenter, positionPetal, intermediateMagnitude);
  positionIntermediate.x += noiseOffsetX;
  positionIntermediate.y += noiseOffsetY;

  stroke(colorPetalSecondary);
  strokeWeight(5);
  noFill();
  beginShape();
  curveVertex(positionCenter.x, positionCenter.y);
  curveVertex(positionCenter.x, positionCenter.y);
  curveVertex(positionIntermediate.x, positionIntermediate.y);
  curveVertex(positionPetal.x, positionPetal.y);
  curveVertex(positionPetal.x, positionPetal.y);
  endShape();


  // line(positionCenter.x, positionCenter.y, positionPetal.x, positionPetal.y);

  strokeWeight(10);
  stroke(color(0));
  point(positionIntermediate.x, positionIntermediate.y);
}

function intermediatePosition(v1, v2, magnitude) {
  let directionVector = p5.Vector.sub(v2, v1);
  let length = directionVector.mag();
  directionVector.setMag(length * magnitude);
  let positionIntermediate = createVector(v1.x + directionVector.x, v1.y + directionVector.y);

  return positionIntermediate;
}

function drawCurve(x, y, noiseSeed, color_, blendModeCode, radio){
  let steps = 10
  let angleStep = TWO_PI / steps;
  let curvePoints = new Array(steps);
  let index = 0;

  // calculate points

  for (let i = 0; i < TWO_PI; i += angleStep) {
    let noiseOffsetX = noise((frameCount * petalsFormNoiseSpeed) + (i * 1000) + noiseSeed) * petalsFormNoiseScale;
    let noiseOffsetY = noise((frameCount * petalsFormNoiseSpeed) + (i * 2000) + noiseSeed) * petalsFormNoiseScale;
		let sx = x + (cos(i) * radio) + noiseOffsetX;
		let sy = y + (sin(i) * radio) + noiseOffsetY;

    curvePoints[index] = createVector(sx, sy);
    index ++;
  }

  // Draw curve
  // noFill();
  push();
  fill(color_);
  blendMode(blendModeCode);
  noStroke();
  beginShape();
  curveVertex(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y);

  for (let i = 0; i < curvePoints.length; i++) {
    const p = curvePoints[i];
    // strokeWeight(5);
    // point(p.x, p.y);

    // strokeWeight(1);
    curveVertex(p.x, p.y);
  }
  // console.log("x: " + curvePoints[0].x + ", y: " + curvePoints[0].y);
  curveVertex(curvePoints[0].x, curvePoints[0].y);
  curveVertex(curvePoints[1].x, curvePoints[1].y);
  endShape();
  pop();
}

// function resetPoints() {
//   pointsIndex = 0;
//   resetTime();
// }

// function resetTime() {
//   resetAt = Date.now() + 2_000;
//   console.log("resetTime()");
// }

// function mouseClicked() {
//   points[pointsIndex % points.length] = createVector(mouseX, mouseY);
//   pointsIndex ++;
//   resetTime();
// }

function mouseClicked() {
  blendModeIndex ++;
  if(blendModeIndex >= blendModes.length) {
    blendModeIndex = 0;
  }

  console.log("blendMode: " + blendModes[blendModeIndex]);
}
