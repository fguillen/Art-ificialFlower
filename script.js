const nameForm = document.getElementById("name-form");
const nameField = document.getElementById("name-field");

nameForm.onsubmit = submitForm;

function submitForm(event) {
  showFlower(nameField.value);
  event.preventDefault();
}

function showFlower(name) {
  let p5Ref = new p5(flowerSketch);
  p5Ref.setName(name);
}
