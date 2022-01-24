let flower;

function setup() {
  createCanvas(800, 800);
  frameRate(20);
  colorMode(HSB);
  noiseSeed(1);

  const urlParams = new URLSearchParams(window.location.search);
  let name = urlParams.get("name") || "y1oc9";
  initializeFlower(name);

  // noLoop();
}

function initializeFlower(name) {
  console.log("New Flower: " + name);
  flower = flowerGenerator(name);
}

function flowerGenerator(name) {
  let flowerSeed = Math.abs(name.hashCode());
  console.log("flowerSeed: " + flowerSeed);

  let position = createVector(width / 2, height / 2);
  let numPetals = mapCustom(flowerSeed, 20, 60);
  let petalColor = color(mapCustom(flowerSeed, 0, 255), mapCustom(flowerSeed, 2, 10), mapCustom(flowerSeed, 80, 90));
  let petalLength = mapCustom(flowerSeed, 15, 60);
  let petalWidth = mapCustom(flowerSeed, 10, 40);
  let stemLength = mapCustom(flowerSeed, width / 4, (width / 2) - petalLength);
  let stemWidth = mapCustom(flowerSeed, 2, 12);
  let noisePetalFormScale = mapCustom(flowerSeed, 1, 5);
  let noisePetalPositionScale = mapCustom(flowerSeed, 5, 15);
  let noisePetalInteriorOffsetScale = mapCustom(flowerSeed, 0.1, 0.5);
  let noisePetalExteriorOffsetScale = mapCustom(flowerSeed, 0.1, 0.5);
  let noiseStemCurvePositionScale = mapCustom(flowerSeed, 10, 50);
  let noiseStemCurveOffsetScale = mapCustom(flowerSeed, 0.1, 0.4);

  let flower =
    new Flower(
      position,
      numPetals,
      stemLength,
      petalColor,
      petalLength,
      petalWidth,
      stemWidth,
      noisePetalFormScale,
      noisePetalPositionScale,
      noisePetalInteriorOffsetScale,
      noisePetalExteriorOffsetScale,
      noiseStemCurvePositionScale,
      noiseStemCurveOffsetScale
    )

  console.log("Flower: ", flower);
  return flower;
}

function mouseClicked() {
  let randomString = (Math.random() + 1).toString(36).substring(2);
  initializeFlower(randomString);
}

function mapCustom(seed, min, max) {
  return map(seed % (max - min), 0, (max - min), min, max);
}

function draw() {
  background(255);
  flower.draw();
}

class Flower {
  constructor(
    position,
    numPetals,
    stemLength,
    color_,
    petalLength,
    petalWidth,
    stemWidth,
    noisePetalFormScale,
    noisePetalPositionScale,
    noisePetalInteriorOffsetScale,
    noisePetalExteriorOffsetScale,
    noiseStemCurvePositionScale,
    noiseStemCurveOffsetScale
  ) {
    this.position = position;
    this.numPetals = numPetals;
    this.stemLength = stemLength;
    this.color = color_;
    this.petalLength = petalLength;
    this.petalWidth = petalWidth;
    this.stemWidth = stemWidth;

    this.colorPetalSecondary = color(hue(this.color), saturation(this.color), brightness(this.color) * 0.4);
    this.colorStem = color(hue(this.color), saturation(this.color) * 4, brightness(this.color) * 0.5);

    this.noisePetalForm = new NoiseWrap(noisePetalFormScale, 0.01, "noisePetalForm");
    this.noisePetalPosition = new NoiseWrap(noisePetalPositionScale, 0.005, "noisePetalPosition");
    this.noisePetalInteriorOffset = new NoiseWrap(noisePetalInteriorOffsetScale, 0.01, "noisePetalInteriorOffset");
    this.noisePetalExteriorOffset = new NoiseWrap(noisePetalExteriorOffsetScale, 0.01, "noisePetalExteriorOffset");
    this.noiseStemCurvePosition = new NoiseWrap(noiseStemCurvePositionScale, 0.01, "noiseStemCurvePosition");
    this.noiseStemCurveOffset = new NoiseWrap(noiseStemCurveOffsetScale, 0.01, "noiseStemCurveOffset");
  }

  draw() {
    this.drawPetals();
  }

  drawPetals() {
    let angleStep = TWO_PI / this.numPetals;

    for (let i = 0; i < TWO_PI; i += angleStep) {
      let sx = this.position.x + (cos(i) * this.stemLength);
      let sy = this.position.y + (sin(i) * this.stemLength);

      this.drawPetal(createVector(sx, sy), i * 1000);
    }
  }

  // Draw the petal:
  // - Stem
  // - Exterior petal part
  // - Interior petal part
  drawPetal(petalPosition, noiseSeed) {
    // calculating all the noises
    let noiseExteriorPosition = this.noisePetalPosition.getVector(frameCount + noiseSeed);
    let noiseInteriorPosition = this.noisePetalPosition.getVector(frameCount + noiseSeed + 1000);
    let noiseExteriorOffset = this.noisePetalExteriorOffset.get(frameCount + noiseSeed);
    let noiseInteriorOffset = this.noisePetalInteriorOffset.get(frameCount + noiseSeed);

    // calculate exterior petal position
    let noisedPosition = createVector(petalPosition.x + noiseExteriorPosition.x, petalPosition.y + noiseExteriorPosition.y);
    let exteriorPosition = this.intermediatePosition(this.position, noisedPosition, 1 + noiseExteriorOffset);

    // calculate interior petal position
    let petalInteriorPosition = createVector(exteriorPosition.x + noiseInteriorPosition.x, exteriorPosition.y + noiseInteriorPosition.y);
    let interiorPosition = this.intermediatePosition(this.position, petalInteriorPosition, 0.9 + noiseInteriorOffset);

    // draw everything
    this.drawStem(exteriorPosition, noiseSeed);
    this.drawPetalCurve(exteriorPosition, noiseSeed, this.color, BLEND, 20);
    this.drawPetalCurve(interiorPosition, noiseSeed + 10000, this.colorPetalSecondary, BURN, 10); // BURN blendMode so only already painted pixels are painted
  }

  drawStem(endPosition, noiseSeed) {
    let noisePosition = this.noiseStemCurvePosition.getVector(frameCount + noiseSeed);
    let noiseOffset = this.noiseStemCurveOffset.get(frameCount + noiseSeed);
    let positionIntermediate = this.intermediatePosition(this.position, endPosition, 0.5 + noiseOffset);
    positionIntermediate.add(noisePosition);

    push();
    stroke(this.colorStem);
    strokeWeight(this.stemWidth);
    noFill();
    beginShape();
    curveVertex(this.position.x, this.position.y);
    curveVertex(this.position.x, this.position.y);
    curveVertex(positionIntermediate.x, positionIntermediate.y);
    curveVertex(endPosition.x, endPosition.y);
    curveVertex(endPosition.x, endPosition.y);
    endShape();
    pop();
  }

  // This is the function that real draw the petal
  drawPetalCurve(petalPosition, noiseSeed, color_, blendModeCode){
    let steps = 10
    let angleStep = TWO_PI / steps;
    let curvePoints = new Array(steps);
    let index = 0;

    // Calculate points
    for (let i = 0; i < TWO_PI; i += angleStep) {
      let noisePosition = this.noisePetalForm.getVector(frameCount + noiseSeed + (i * 1000));
      let sx = (cos(i) * this.petalLength) + noisePosition.x;
      let sy = (sin(i) * this.petalWidth) + noisePosition.y;

      curvePoints[index] = createVector(sx, sy);
      index ++;
    }

    // Calculate rotation angle
    let headingVector = p5.Vector.sub(petalPosition, this.position)
    let angle = headingVector.heading();

    // Draw curve
    push();
    fill(color_);
    blendMode(blendModeCode);
    noStroke();
    translate(petalPosition.x, petalPosition.y);
    rotate(angle);
    beginShape();
    curveVertex(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y);

    for (let i = 0; i < curvePoints.length; i++) {
      curveVertex(curvePoints[i].x, curvePoints[i].y);
    }
    curveVertex(curvePoints[0].x, curvePoints[0].y);
    curveVertex(curvePoints[1].x, curvePoints[1].y);
    endShape();
    pop();
  }

  intermediatePosition(v1, v2, magnitude) {
    let directionVector = p5.Vector.sub(v2, v1);
    let length = directionVector.mag();
    directionVector.setMag(length * magnitude);
    let positionIntermediate = createVector(v1.x + directionVector.x, v1.y + directionVector.y);

    return positionIntermediate;
  }

}

class NoiseWrap {
  constructor(scale, speed, seed = "") {
    this.scale = scale;
    this.speed = speed;
    this.seed = Math.abs(seed.hashCode());
    this.seed2 = this.seed + 1_000;
  }

  get(position) {
    return this.mappedNoise((position * this.speed) + this.seed) * this.scale;
  }

  getVector(position) {
    return createVector(this.get(position), this.get(position + this.seed2));
  }

  mappedNoise(value) {
    let n = noise(value);
    return map(n, 0, 1, -1, 1);
  }
}


// From here: https://stackoverflow.com/a/7616484/316700
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
