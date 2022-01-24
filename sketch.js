const flowerSketch = p => {
  let flower;

  p.setup = function() {
    let canvas = p.createCanvas(800, 800);
    canvas.parent('p5-div');
    p.frameRate(20);
    p.colorMode(p.HSB);
    p.noiseSeed(1);

    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get("name") || "y1oc9";
    p.initializeFlower(name);

    // noLoop();
  }

  p.draw = function() {
    p.background(255);
    flower.draw();
  }

  p.mouseClicked = function() {
    let randomString = (Math.random() + 1).toString(36).substring(2);
    p.initializeFlower(randomString);
  }

  p.initializeFlower = function(name) {
    console.log("New Flower: " + name);
    flower = p.flowerGenerator(name);
  }

  p.flowerGenerator = function(name) {
    let flowerSeed = Math.abs(name.hashCode());
    console.log("flowerSeed: " + flowerSeed);

    let position = p.createVector(p.width / 2, p.height / 2);
    let numPetals = p.mapCustom(flowerSeed, 20, 60);
    let petalColor = p.color(p.mapCustom(flowerSeed, 0, 255), 5, 82);
    let petalLength = p.mapCustom(flowerSeed, 15, 60);
    let petalWidth = p.mapCustom(flowerSeed, 10, 40);
    let stemLength = p.mapCustom(flowerSeed, p.width / 4, (p.width / 2) - petalLength);
    let stemWidth = p.mapCustom(flowerSeed, 2, 12);
    let noisePetalFormScale = p.mapCustom(flowerSeed, 1, 5);
    let noisePetalPositionScale = p.mapCustom(flowerSeed, 5, 15);
    let noisePetalInteriorOffsetScale = p.mapCustom(flowerSeed, 0.1, 0.5);
    let noisePetalExteriorOffsetScale = p.mapCustom(flowerSeed, 0.1, 0.5);
    let noiseStemCurvePositionScale = p.mapCustom(flowerSeed, 10, 50);
    let noiseStemCurveOffsetScale = p.mapCustom(flowerSeed, 0.1, 0.4);

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

  p.mapCustom = function(seed, min, max) {
    return p.map(seed % (max - min), 0, (max - min), min, max);
  }
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

    this.colorPetalSecondary = p5Ref.color(p5Ref.hue(this.color), p5Ref.saturation(this.color), p5Ref.brightness(this.color) * 0.4);
    this.colorStem = p5Ref.color(p5Ref.hue(this.color), p5Ref.saturation(this.color) * 4, p5Ref.brightness(this.color) * 0.5);

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
    let angleStep = p5Ref.TWO_PI / this.numPetals;

    for (let i = 0; i < p5Ref.TWO_PI; i += angleStep) {
      let sx = this.position.x + (p5Ref.cos(i) * this.stemLength);
      let sy = this.position.y + (p5Ref.sin(i) * this.stemLength);

      this.drawPetal(p5Ref.createVector(sx, sy), i * 1000);
    }
  }

  // Draw the petal:
  // - Stem
  // - Exterior petal part
  // - Interior petal part
  drawPetal(petalPosition, noiseSeed) {
    // calculating all the noises
    let noiseExteriorPosition = this.noisePetalPosition.getVector(p5Ref.frameCount + noiseSeed);
    let noiseInteriorPosition = this.noisePetalPosition.getVector(p5Ref.frameCount + noiseSeed + 1000);
    let noiseExteriorOffset = this.noisePetalExteriorOffset.get(p5Ref.frameCount + noiseSeed);
    let noiseInteriorOffset = this.noisePetalInteriorOffset.get(p5Ref.frameCount + noiseSeed);

    // calculate exterior petal position
    let noisedPosition = p5Ref.createVector(petalPosition.x + noiseExteriorPosition.x, petalPosition.y + noiseExteriorPosition.y);
    let exteriorPosition = this.intermediatePosition(this.position, noisedPosition, 1 + noiseExteriorOffset);

    // calculate interior petal position
    let petalInteriorPosition = p5Ref.createVector(exteriorPosition.x + noiseInteriorPosition.x, exteriorPosition.y + noiseInteriorPosition.y);
    let interiorPosition = this.intermediatePosition(this.position, petalInteriorPosition, 0.9 + noiseInteriorOffset);

    // draw everything
    this.drawStem(exteriorPosition, noiseSeed);
    this.drawPetalCurve(exteriorPosition, noiseSeed, this.color, p5Ref.BLEND, 20);
    this.drawPetalCurve(interiorPosition, noiseSeed + 10000, this.colorPetalSecondary, p5Ref.BURN, 10); // BURN blendMode so only already painted pixels are painted
  }

  drawStem(endPosition, noiseSeed) {
    let noisePosition = this.noiseStemCurvePosition.getVector(p5Ref.frameCount + noiseSeed);
    let noiseOffset = this.noiseStemCurveOffset.get(p5Ref.frameCount + noiseSeed);
    let positionIntermediate = this.intermediatePosition(this.position, endPosition, 0.5 + noiseOffset);
    positionIntermediate.add(noisePosition);

    p5Ref.push();
    p5Ref.stroke(this.colorStem);
    p5Ref.strokeWeight(this.stemWidth);
    p5Ref.noFill();
    p5Ref.beginShape();
    p5Ref.curveVertex(this.position.x, this.position.y);
    p5Ref.curveVertex(this.position.x, this.position.y);
    p5Ref.curveVertex(positionIntermediate.x, positionIntermediate.y);
    p5Ref.curveVertex(endPosition.x, endPosition.y);
    p5Ref.curveVertex(endPosition.x, endPosition.y);
    p5Ref.endShape();
    p5Ref.pop();
  }

  // This is the function that real draw the petal
  drawPetalCurve(petalPosition, noiseSeed, color_, blendModeCode){
    let steps = 10
    let angleStep = p5Ref.TWO_PI / steps;
    let curvePoints = new Array(steps);
    let index = 0;

    // Calculate points
    for (let i = 0; i < p5Ref.TWO_PI; i += angleStep) {
      let noisePosition = this.noisePetalForm.getVector(p5Ref.frameCount + noiseSeed + (i * 1000));
      let sx = (p5Ref.cos(i) * this.petalLength) + noisePosition.x;
      let sy = (p5Ref.sin(i) * this.petalWidth) + noisePosition.y;

      curvePoints[index] = p5Ref.createVector(sx, sy);
      index ++;
    }

    // Calculate rotation angle
    let headingVector = p5.Vector.sub(petalPosition, this.position)
    let angle = headingVector.heading();

    // Draw curve
    p5Ref.push();
    p5Ref.fill(color_);
    p5Ref.blendMode(blendModeCode);
    p5Ref.noStroke();
    p5Ref.translate(petalPosition.x, petalPosition.y);
    p5Ref.rotate(angle);
    p5Ref.beginShape();
    p5Ref.curveVertex(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y);

    for (let i = 0; i < curvePoints.length; i++) {
      p5Ref.curveVertex(curvePoints[i].x, curvePoints[i].y);
    }
    p5Ref.curveVertex(curvePoints[0].x, curvePoints[0].y);
    p5Ref.curveVertex(curvePoints[1].x, curvePoints[1].y);
    p5Ref.endShape();
    p5Ref.pop();
  }

  intermediatePosition(v1, v2, magnitude) {
    let directionVector = p5.Vector.sub(v2, v1);
    let length = directionVector.mag();
    directionVector.setMag(length * magnitude);
    let positionIntermediate = p5Ref.createVector(v1.x + directionVector.x, v1.y + directionVector.y);

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
    return p5Ref.createVector(this.get(position), this.get(position + this.seed2));
  }

  mappedNoise(value) {
    let n = p5Ref.noise(value);
    return p5Ref.map(n, 0, 1, -1, 1);
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
