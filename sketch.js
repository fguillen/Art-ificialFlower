const flowerSketch = p5_ => {
  let flower;

  p5_.setup = function() {
    let canvas = p5_.createCanvas(800, 800);
    canvas.parent('p5-div');
    p5_.frameRate(20);
    p5_.colorMode(p5_.HSB);
    p5_.noiseSeed(1);

    // this.name = this.name || "y1oc9";
    // flower = Utils.flowerGenerator(this.name);

    // noLoop();
    p5_.centerPosition = p5_.createVector(p5_.width / 2, p5_.height / 2);
  }

  p5_.setName = function (name) {
    this.name = name;
    flower = Utils.flowerGenerator(this.name);
  }

  p5_.draw = function() {
    if(flower == null) return;

    p5_.background(255);
    flower.draw();
  }

  // p5_.mouseClicked = function() {
  //   let randomString = (Math.random() + 1).toString(36).substring(2);
  //   flower = Utils.flowerGenerator(randomString);
  // }


  // Class Utils
  class Utils {
    static flowerGenerator(name) {
      let flowerSeed = Math.abs(name.hashCode());
      console.log("name: '" + name + "', flowerSeed: " + flowerSeed);

      let position = p5_.centerPosition;
      let numPetals = Utils.mapCustom(flowerSeed, 20, 60);
      let petalColor = p5_.color(Utils.mapCustom(flowerSeed, 0, 255), 5, 82);
      let petalLength = Utils.mapCustom(flowerSeed, 15, 60);
      let petalWidth = Utils.mapCustom(flowerSeed, 10, 40);
      let stemLength = Utils.mapCustom(flowerSeed, p5_.width / 4, (p5_.width / 2) - petalLength);
      let stemWidth = Utils.mapCustom(flowerSeed, 2, 12);
      let noisePetalFormScale = Utils.mapCustom(flowerSeed, 1, 5);
      let noisePetalPositionScale = Utils.mapCustom(flowerSeed, 5, 15);
      let noisePetalInteriorOffsetScale = Utils.mapCustom(flowerSeed, 0.1, 0.5);
      let noisePetalExteriorOffsetScale = Utils.mapCustom(flowerSeed, 0.1, 0.5);
      let noiseStemCurvePositionScale = Utils.mapCustom(flowerSeed, 10, 50);
      let noiseStemCurveOffsetScale = Utils.mapCustom(flowerSeed, 0.1, 0.4);

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

    static mapCustom(seed, min, max) {
      return p5_.map(seed % (max - min), 0, (max - min), min, max);
    }
  }

  // Class Flower
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
      this.flowerPosition = position;
      this.numPetals = numPetals;
      this.stemLength = stemLength;
      this.color = color_;
      this.petalLength = petalLength;
      this.petalWidth = petalWidth;
      this.stemWidth = stemWidth;

      this.colorPetalSecondary = p5_.color(p5_.hue(this.color), p5_.saturation(this.color), p5_.brightness(this.color) * 0.4);
      this.colorStem = p5_.color(p5_.hue(this.color), p5_.saturation(this.color) * 4, p5_.brightness(this.color) * 0.5);

      this.noisePetalForm = new NoiseWrap(noisePetalFormScale, 0.01, "noisePetalForm");
      this.noisePetalPosition = new NoiseWrap(noisePetalPositionScale, 0.02, "noisePetalPosition");
      this.noisePetalInteriorOffset = new NoiseWrap(noisePetalInteriorOffsetScale, 0.01, "noisePetalInteriorOffset");
      this.noisePetalExteriorOffset = new NoiseWrap(noisePetalExteriorOffsetScale, 0.01, "noisePetalExteriorOffset");
      this.noiseStemCurvePosition = new NoiseWrap(noiseStemCurvePositionScale, 0.01, "noiseStemCurvePosition");
      this.noiseStemCurveOffset = new NoiseWrap(noiseStemCurveOffsetScale, 0.01, "noiseStemCurveOffset");

      // Flower starting attributes
      this.noiseSeedForm = new NoiseWrap(2, 0.1, "noiseSeedForm");
      this.noiseFirstPetalsSize = new NoiseWrap(2, 0.1, "noiseFirstPetalsSize");
      this.seedFrames = 30;
      this.seedFrameIni = p5_.frameCount;
      this.flowerState = "seed";
      this.temporalStemLength = 10;
      this.temporalStemLengthSpeed = 5;
      this.bigStemsFrameIni;
      this.bigStemsFrames = 20;
      this.temporalPetalsSize = 0.01;
      this.temporalPetalsSizeSpeed = 0.02;
    }

    draw() {
      switch (this.flowerState) {
        case "seed":
          this.drawSeed();
          break;
        case "smallStems":
          this.drawSmallStems();
          break;
        case "bigStems":
          this.drawBigStems();
          break;
        case "firstPetals":
          this.drawFirstPetals();
          break;
        case "completed":
          this.drawCompletedFlower();
          break;
        default:
          console.error("FlowerState not supported: '" + this.flowerState + "'");
          break;
      }
    }

    drawSeed() {
      this.drawPetalCurve(p5_.centerPosition, 10, 10, 100, this.colorStem, p5_.BLEND, this.noiseSeedForm);

      if(p5_.frameCount >= (this.seedFrameIni + this.seedFrames)) {
        this.flowerState = "smallStems";
      }
    }

    drawSmallStems() {
      let positions = this.getPetalPositions(this.temporalStemLength);

      for (let i = 0; i < positions.length; i++) {
        this.drawStem(positions[i], i * 1000);
      }

      this.temporalStemLength += this.temporalStemLengthSpeed
      if(this.temporalStemLength >= this.stemLength) {
        this.bigStemsFrameIni = p5_.frameCount;
        this.flowerState = "bigStems";
      }
    }

    drawBigStems() {
      let positions = this.getPetalPositions(this.stemLength);

      for (let i = 0; i < positions.length; i++) {
        this.drawStem(positions[i], i * 1000);
      }

      if(p5_.frameCount >= (this.bigStemsFrameIni + this.bigStemsFrames)) {
        this.flowerState = "firstPetals";
      }
    }

    drawFirstPetals() {
      let positions = this.getPetalPositions(this.stemLength);

      for (let i = 0; i < positions.length; i++) {
        let noiseSize = this.noiseFirstPetalsSize.getVector(p5_.frameCount + (i * 1000));
        let petalLength = (this.petalLength * this.temporalPetalsSize) + noiseSize.x;
        let petalWidth = (this.petalWidth * this.temporalPetalsSize) + noiseSize.y;
        this.drawPetal(positions[i], i * 1000, petalLength, petalWidth);
      }

      this.temporalPetalsSize += this.temporalPetalsSizeSpeed
      if(this.temporalPetalsSize >= 1) {
        this.flowerState = "completed";
      }
    }

    drawCompletedFlower() {
      let positions = this.getPetalPositions(this.stemLength);

      for (let i = 0; i < positions.length; i++) {
        this.drawPetal(positions[i], i * 1000, this.petalLength, this.petalWidth);
      }
    }

    // Draw the petal:
    // - Stem
    // - Exterior petal part
    // - Interior petal part
    drawPetal(petalPosition, noiseSeed, petalLength, petalWidth) {
      // calculating all the noises
      let noiseInteriorPosition = this.noisePetalPosition.getVector(p5_.frameCount + noiseSeed + 1000);
      let noiseInteriorOffset = this.noisePetalInteriorOffset.get(p5_.frameCount + noiseSeed);

      // calculate interior petal position
      let petalInteriorPosition = p5_.createVector(petalPosition.x + noiseInteriorPosition.x, petalPosition.y + noiseInteriorPosition.y);
      let interiorPosition = this.intermediatePosition(this.flowerPosition, petalInteriorPosition, 0.9 + noiseInteriorOffset);

      // draw everything
      this.drawStem(petalPosition, noiseSeed);
      this.drawPetalCurve(petalPosition, petalLength, petalWidth, noiseSeed, this.color, p5_.BLEND, this.noisePetalForm);
      this.drawPetalCurve(interiorPosition, petalLength, petalWidth, noiseSeed + 10000, this.colorPetalSecondary, p5_.BURN, this.noisePetalForm); // BURN blendMode so only already painted pixels are painted
    }

    drawStem(endPosition, noiseSeed) {
      let noisePosition = this.noiseStemCurvePosition.getVector(p5_.frameCount + noiseSeed);
      let noiseOffset = this.noiseStemCurveOffset.get(p5_.frameCount + noiseSeed);
      let positionIntermediate = this.intermediatePosition(this.flowerPosition, endPosition, 0.5 + noiseOffset);
      positionIntermediate.add(noisePosition);

      p5_.push();
      p5_.stroke(this.colorStem);
      p5_.strokeWeight(this.stemWidth);
      p5_.noFill();
      p5_.beginShape();
      p5_.curveVertex(this.flowerPosition.x, this.flowerPosition.y);
      p5_.curveVertex(this.flowerPosition.x, this.flowerPosition.y);
      p5_.curveVertex(positionIntermediate.x, positionIntermediate.y);
      p5_.curveVertex(endPosition.x, endPosition.y);
      p5_.curveVertex(endPosition.x, endPosition.y);
      p5_.endShape();
      p5_.pop();
    }

    // This is the function that real draw the petal
    drawPetalCurve(petalPosition, petalLength, petalWidth, noiseSeed, color_, blendModeCode, noiseGenerator){
      let steps = 10
      let angleStep = p5_.TWO_PI / steps;
      let curvePoints = new Array(steps);
      let index = 0;

      // Calculate points
      for (let i = 0; i < p5_.TWO_PI; i += angleStep) {
        let noisePosition = noiseGenerator.getVector(p5_.frameCount + noiseSeed + (i * 1000));
        let sx = (p5_.cos(i) * petalLength) + noisePosition.x;
        let sy = (p5_.sin(i) * petalWidth) + noisePosition.y;

        curvePoints[index] = p5_.createVector(sx, sy);
        index ++;
      }

      // Calculate rotation angle
      let headingVector = p5.Vector.sub(petalPosition, this.flowerPosition)
      let angle = headingVector.heading();

      // Draw curve
      p5_.push();
      p5_.fill(color_);
      p5_.blendMode(blendModeCode);
      p5_.noStroke();
      p5_.translate(petalPosition.x, petalPosition.y);
      p5_.rotate(angle);
      p5_.beginShape();
      p5_.curveVertex(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y);

      for (let i = 0; i < curvePoints.length; i++) {
        p5_.curveVertex(curvePoints[i].x, curvePoints[i].y);
      }
      p5_.curveVertex(curvePoints[0].x, curvePoints[0].y);
      p5_.curveVertex(curvePoints[1].x, curvePoints[1].y);
      p5_.endShape();
      p5_.pop();
    }

    intermediatePosition(v1, v2, magnitude) {
      let directionVector = p5.Vector.sub(v2, v1);
      let length = directionVector.mag();
      directionVector.setMag(length * magnitude);
      let positionIntermediate = p5_.createVector(v1.x + directionVector.x, v1.y + directionVector.y);

      return positionIntermediate;
    }

    getPetalPositions(stemLength) {
      let result = [];
      let index = 0;
      let angleStep = p5_.TWO_PI / this.numPetals;

      for (let i = 0; i < p5_.TWO_PI; i += angleStep) {
        let sx = this.flowerPosition.x + (p5_.cos(i) * stemLength);
        let sy = this.flowerPosition.y + (p5_.sin(i) * stemLength);

        let noisePosition = this.noisePetalPosition.getVector(p5_.frameCount + (i * 1000));
        let noiseOffset = this.noisePetalExteriorOffset.get(p5_.frameCount + (i * 1000));

        // position
        let position = p5_.createVector(sx + noisePosition.x, sy + noisePosition.y);
        noisePosition.add(position);

        // distant to center
        let finalPosition = this.intermediatePosition(this.flowerPosition, noisePosition, 1 + noiseOffset);

        result[index] = finalPosition;
        index ++;
      }

      return result;
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
      return p5_.createVector(this.get(position), this.get(position + this.seed2));
    }

    mappedNoise(value) {
      let n = p5_.noise(value);
      return p5_.map(n, 0, 1, -1, 1);
    }
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
