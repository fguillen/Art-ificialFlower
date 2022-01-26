console.log("Art-ificial Flower v0.1.13");

function generateFlowers() {
  document.querySelectorAll(".p5-div").forEach( element => {
    let seed = CryptoJS.lib.WordArray.random(128 / 8).toString();
    loadFlower(seed, element)
  })
}

function loadFlower(seed, element) {
  p5Ref = new p5(flowerSketch, element);
  p5Ref.setWidthAndSeed(elementWidth(element), seed);
}

function elementWidth(element) {
  return (
    element.clientWidth -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
  )
}

function showShareButtons() {
  // Nothing, just needed so script doesn't break
}


// Window loaded
window.addEventListener("load", function(){
  generateFlowers();
});
