let numPetals;
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
let petalsRadioA;
let petalsRadioB;
let petalsExteriorMagnitudeScale;
let petalsInteriorMagnitudeScale;

function setup() {
  createCanvas(800, 800);
  frameRate(20);
  colorMode(HSB);

  numPetals = 64;
  petalsRadioA = 40;
  petalsRadioB = 10;
  stemLength = 250
  petalsFormNoiseScale = 5;
  petalsFormNoiseSpeed = 0.01;
  petalsPositionNoiseScale = 10;
  petalsPositionNoiseSpeed = 0.005;
  petalsInteriorMagnitudeScale = 0.1;
  petalsExteriorMagnitudeScale = 0.1;
  stemsPositionNoiseScale = 15;
  stemsPositionNoiseSpeed = 0.005;
  stemsMagnitudeNoiseScale = 1;
  stemsMagnitudeNoiseSpeed = 0.01;
  colorPetal = color(222, 5, 82);
  colorPetalSecondary = color(hue(colorPetal), saturation(colorPetal), brightness(colorPetal) * 0.4);
  colorStem = color(220, 36, 45);

  blendModes = [
    BLEND, DARKEST, LIGHTEST, DIFFERENCE, MULTIPLY, EXCLUSION, SCREEN, REPLACE, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN, ADD, REMOVE
  ]
  blendModeIndex = 0;

  // noLoop();
}

function draw() {
  background(255);

  drawPetals();
}

function drawPetals() {
  let angleStep = TWO_PI / numPetals;
  let x = width / 2;
  let y = height / 2;

  for (let i = 0; i < TWO_PI; i += angleStep) {
		let sx = x + (cos(i) * stemLength);
		let sy = y + (sin(i) * stemLength);

    drawPetal(sx, sy, i * 1000);
  }
}

function drawPetal(x, y, noiseSeed) {
  colorMode(HSB);

  let noiseOffsetXExterior = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed) * petalsPositionNoiseScale;
  let noiseOffsetYExterior = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 1000) * petalsPositionNoiseScale;
  let noiseOffsetXInterior = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 2000) * petalsPositionNoiseScale;
  let noiseOffsetYInterior = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 3000) * petalsPositionNoiseScale;
  let noiseExteriorIntermediateMagnitude = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 5000) * petalsExteriorMagnitudeScale;
  let noiseInteriorIntermediateMagnitude = mappedNoise((frameCount * petalsPositionNoiseSpeed) + noiseSeed + 4000) * petalsInteriorMagnitudeScale;
  let noisedX = x + noiseOffsetXExterior;
  let noisedY = y + noiseOffsetYExterior;

  let centerPosition = createVector(width / 2, height / 2);
  let exteriorPetalPosition = createVector(noisedX, noisedY);
  exteriorPetalPosition = intermediatePosition(centerPosition, exteriorPetalPosition, 1 + noiseExteriorIntermediateMagnitude);

  drawStem(exteriorPetalPosition.x, exteriorPetalPosition.y, noiseSeed);
  drawCurve(exteriorPetalPosition.x, exteriorPetalPosition.y, noiseSeed, colorPetal, BLEND, 20);


  let petalInteriorPosition = createVector(exteriorPetalPosition.x + noiseOffsetXInterior, exteriorPetalPosition.y + noiseOffsetYInterior);
  let secondPetalPosition = intermediatePosition(centerPosition, petalInteriorPosition, 0.9 + noiseInteriorIntermediateMagnitude);

  drawCurve(secondPetalPosition.x, secondPetalPosition.y, noiseSeed + 10000, colorPetalSecondary, BURN, 10);
}


function drawStem(x, y, noiseSeed) {
  let noiseOffsetX = mappedNoise((frameCount * stemsPositionNoiseSpeed) + noiseSeed) * stemsPositionNoiseScale;
  let noiseOffsetY = mappedNoise((frameCount * stemsPositionNoiseSpeed) + noiseSeed + 1000) * stemsPositionNoiseScale;

  let intermediateMagnitude = noise((frameCount * stemsMagnitudeNoiseSpeed) + noiseSeed + 2000) * stemsMagnitudeNoiseScale;
  let positionCenter = createVector(width / 2, height / 2);
  let positionPetal = createVector(x, y);
  let positionIntermediate = intermediatePosition(positionCenter, positionPetal, intermediateMagnitude);
  positionIntermediate.x += noiseOffsetX;
  positionIntermediate.y += noiseOffsetY;

  stroke(colorStem);
  strokeWeight(5);
  noFill();
  beginShape();
  curveVertex(positionCenter.x, positionCenter.y);
  curveVertex(positionCenter.x, positionCenter.y);
  curveVertex(positionIntermediate.x, positionIntermediate.y);
  curveVertex(positionPetal.x, positionPetal.y);
  curveVertex(positionPetal.x, positionPetal.y);
  endShape();

  // strokeWeight(10);
  // stroke(color(0));
  // point(positionIntermediate.x, positionIntermediate.y);
}

function intermediatePosition(v1, v2, magnitude) {
  let directionVector = p5.Vector.sub(v2, v1);
  let length = directionVector.mag();
  directionVector.setMag(length * magnitude);
  let positionIntermediate = createVector(v1.x + directionVector.x, v1.y + directionVector.y);

  return positionIntermediate;
}

function mappedNoise(value) {
  let n = noise(value);
  return map(n, 0, 1, -1, 1);
}

function drawCurve(x, y, noiseSeed, color_, blendModeCode){
  let steps = 10
  let angleStep = TWO_PI / steps;
  let curvePoints = new Array(steps);
  let index = 0;

  // calculate points

  for (let i = 0; i < TWO_PI; i += angleStep) {
    let noiseOffsetX = mappedNoise((frameCount * petalsFormNoiseSpeed) + (i * 1000) + noiseSeed) * petalsFormNoiseScale;
    let noiseOffsetY = mappedNoise((frameCount * petalsFormNoiseSpeed) + (i * 2000) + noiseSeed) * petalsFormNoiseScale;
		let sx = (cos(i) * petalsRadioA) + noiseOffsetX;
		let sy = (sin(i) * petalsRadioB) + noiseOffsetY;

    curvePoints[index] = createVector(sx, sy);
    index ++;
  }

  // Calculate rotation angle
  let positionPetal = createVector(x, y);
  let positionCenter = createVector(width / 2, height / 2);
  let headingVector = p5.Vector.sub(positionPetal, positionCenter)
  let angle = headingVector.heading();

  // Draw curve
  // noFill();
  push();
  fill(color_);
  blendMode(blendModeCode);
  noStroke();
  translate(x, y);
  rotate(angle);
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
