const nameForm = document.getElementById("name-form");
const nameField = document.getElementById("name-field");
const shareWrapper = document.getElementById("share-wrapper");
const shareMobile = document.getElementById("share-mobile");
const shareMobileLink = document.getElementById("share-mobile-link");
const shareDesktop = document.getElementById("share-desktop");
const p5Div = document.getElementById("p5-div");
const seedTextElement = document.getElementById("seed-text");
const socialButtons = document.getElementById("social-buttons");

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
  let p5Ref = new p5(flowerSketch);
  p5Ref.setWidthAndName(elementWidth(p5Div), name);
}

function showShareButtons(seedText) {
  shareWrapper.classList.remove("hidden");
  shareWrapper.classList.add("fadein");


  window.location.hash = seedText;
  document.title = document.title + " for Seed " + seedText;

  seedTextElement.innerText = seedText;
  seedTextElement.setAttribute("href", window.location.toString());

  socialButtons.setAttribute("data-meta-link", window.location.toString());
  socialButtons.setAttribute("data-meta-title", "This is my art-ificial flower, how is yours?")
  socializer(".socializer");
}

function initializeShareDiv() {
  shareWrapper.classList.add("hidden");

  // Share Buttons
  if (navigator.share) {
    shareDesktop.classList.add("hidden");

    shareMobileLink.addEventListener("click", event => {
      navigator.share({
        title: document.title,
        text: "This is my Art-ificial Flower",
        url: window.location.href
      })
      .then(() => console.log('Successful share'))
      .catch(error => console.log('Error sharing:', error));
    });
  } else {
    shareMobile.classList.add("hidden");
  }
}

function loadFlower(seed) {
  let p5Ref = new p5(flowerSketch);
  p5Ref.setWidthAndSeed(elementWidth(p5Div), seed);
}

// Window loaded
window.addEventListener("load", function(){
  initializeShareDiv();
  if(window.location.hash != ""){
    loadFlower(window.location.hash.substring(1));
  } else {
    nameForm.classList.remove("hidden");
    nameForm.classList.add("fadein");
  }
});
