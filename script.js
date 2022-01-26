const nameForm = document.getElementById("name-form");
const nameField = document.getElementById("name-field");
const shareWrapper = document.getElementById("share-wrapper");
const shareMobile = document.getElementById("share-mobile");
const shareMobileLink = document.getElementById("share-mobile-link");
const shareDesktop = document.getElementById("share-desktop");
const p5Div = document.getElementById("p5-div");
const seedTextElement = document.getElementById("seed-text");
const socialButtons = document.getElementById("social-buttons");

var p5Ref;

console.log("Art-ificial Flower v0.1.13");

nameForm.onsubmit = submitForm;

function submitForm(event) {
  event.preventDefault();

  showFlower(nameField.value);
  nameForm.classList.add("hidden");
}

function elementWidth(element) {
  return (
    element.clientWidth -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
  )
}

function showFlower(name) {
  p5Ref = new p5(flowerSketch);
  p5Ref.setWidthAndName(elementWidth(p5Div), name);
}

function showShareButtons(seedText) {
  shareWrapper.classList.remove("hidden");
  shareWrapper.classList.add("fadein");

  // Update url and title
  window.location.hash = seedText;
  document.title = document.title + " for Seed " + seedText;

  seedTextElement.innerText = seedText;
  seedTextElement.setAttribute("href", window.location.toString());

  updateShareLinks()
}

function updateShareLinks() {
  socialButtons.setAttribute("data-meta-link", window.location.toString());
  socialButtons.setAttribute("data-meta-title", "This is my Art-ificial Flower, how is yours?")
  socializer(".socializer");

  // Mobile Share Button
  if (navigator.share) {
    shareMobileLink.addEventListener("click", event => {
      navigator.share({
        title: document.title,
        text: "This is my Art-ificial Flower, how is yours?",
        url: window.location.toString()
      })
      .then(() => console.log("Successful share"))
      .catch(error => console.log("Error sharing:", error));
    });
  }
}

function initializeShareDivVisibility() {
  shareWrapper.classList.add("hidden");

  if (navigator.share) {
    shareDesktop.classList.add("hidden");
  } else {
    shareMobile.classList.add("hidden");
  }
}

function loadFlower(seed) {
  p5Ref = new p5(flowerSketch);
  p5Ref.setWidthAndSeed(elementWidth(p5Div), seed);
}

// Window loaded
window.addEventListener("load", function(){
  initializeShareDivVisibility();

  if(window.location.hash != ""){
    loadFlower(window.location.hash.substring(1));
  } else {
    nameForm.classList.remove("hidden");
    nameForm.classList.add("fadein");
  }
});
