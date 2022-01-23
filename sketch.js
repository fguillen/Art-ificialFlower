// let numPetals;
// let petalsFormNoiseScale;
// let petalsFormNoiseSpeed;
// let petalsPositionNoiseScale;
// let petalsPositionNoiseSpeed;
// let blendModes;
// let blendModeIndex;
// let colorPetal;
// let colorPetalSecondary;
// let stemsPositionNoiseScale;
// let stemsPositionNoiseSpeed;
// let stemsMagnitudeNoiseScale;
// let stemsMagnitudeNoiseSpeed;
// let petalsRadioA;
// let petalsRadioB;
// let petalsExteriorMagnitudeScale;
// let petalsInteriorMagnitudeScale;
let flowers;

function setup() {
  createCanvas(800, 800);
  frameRate(20);
  colorMode(HSB);

  flowers = [];
  flowers.push(new Flower(createVector(300, 100), 40, 100, color(50, 5, 82), 10, 12));
  flowers.push(new Flower(createVector(500, 500), 64, 250, color(100, 5, 82), 40, 10))
  flowers.push(new Flower(createVector(150, 700), 20, 100, color(222, 5, 82), 30, 15))

  // noLoop();
}

function draw() {
  background(255);
  flowers.forEach(flower => {
    flower.draw();
  });
}

class NoiseWrap {
  constructor(scale, speed) {
    this.scale = scale;
    this.speed = speed;
    this.seed = random(0, 100_000);
    this.seed2 = random(0, 100_000);
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


class Flower {
  constructor(position, numPetals, stemLength, color_, petalLength, petalWidth) {
    this.position = position;
    this.numPetals = numPetals;
    this.stemLength = stemLength;
    this.color = color_;
    this.petalLength = petalLength;
    this.petalWidth = petalWidth;
    this.stemWidth = map(stemLength, 0, 300, 1, 6);

    this.noisePetalForm = new NoiseWrap(3, 0.01);
    this.noisePetalPosition = new NoiseWrap(10, 0.005);
    this.noisePetalInteriorOffset = new NoiseWrap(0.2, 0.01);
    this.noisePetalExteriorOffset = new NoiseWrap(0.1, 0.01);
    this.noiseStemCurvePosition = new NoiseWrap(15, 0.005);
    this.noiseStemCurveOffset = new NoiseWrap(0.2, 0.01);
    this.noiseStemStroke = new NoiseWrap(2, 0.01);


    this.colorPetalSecondary = color(hue(this.color), saturation(this.color), brightness(this.color) * 0.4);
    this.colorStem = color(hue(this.color), saturation(this.color) * 4, brightness(this.color) * 0.5);
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
    let noiseExteriorOffset = this.noisePetalExteriorOffset.get(frameCount + noiseSeed + 2000);
    let noiseInteriorOffset = this.noisePetalInteriorOffset.get(frameCount + noiseSeed + 3000);
    let noisedPosition = createVector(petalPosition.x + noiseExteriorPosition.x, petalPosition.y + noiseExteriorPosition.y);

    // calculate exterior petal position
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
    let noiseStroke = this.noiseStemStroke.get(frameCount + noiseOffset);
    let positionIntermediate = this.intermediatePosition(this.position, endPosition, 0.5 + noiseOffset);
    positionIntermediate.add(noisePosition);

    push();
    stroke(this.colorStem);
    strokeWeight(this.stemWidth + noiseStroke);
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
