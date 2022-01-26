console.log("Art-ificial Flower v0.1.17");

function generateFlowers() {
  console.log("generateFlowers");
  document.querySelectorAll(".flower-div").forEach( element => {
    console.log("element " + element);
    const p5Div = element.querySelector(".p5-div");
    const link = element.querySelector("a");
    const seed = CryptoJS.lib.WordArray.random(128 / 8).toString();
    link.setAttribute("href", "./../#" + seed);
    link.innerHTML = seed;
    loadFlower(seed, p5Div)
  });
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
