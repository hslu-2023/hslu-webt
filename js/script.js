function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// display message on top of form
function displayMessage(messageText, color) {
  let message = document.getElementById("message");
  message.innerText = messageText;
  message.classList = "";
  message.classList.add("w3-text-" + color);
}

function getInputElementValues() {
  return {
    title: document.getElementById("title").value.trim(),
    reason: document.getElementById("reason").value.trim(),
    country: document.getElementById("country").value.trim(),
    city: document.getElementById("city").value.trim(),
    latitude: document.getElementById("latitude").value.trim(),
    longitude: document.getElementById("longitude").value.trim(),
    description: document.getElementById("description").value.trim(),
  };
}

function displayTrips(trips) {
  initCanvas(trips);

  let leisureTripsElement = document.getElementById("leisure-trips");

  leisureTripsElement.innerHTML = "";

  if (!trips.length) {
    leisureTripsElement.innerHTML = "<p>No leisure trips found.</p>";
  } else {
    trips.forEach((trip) => {
      let div = document.createElement("div");
      div.classList.add("w3-card-4", "w3-margin-top", "w3-round");
      div.innerHTML = `
       <header class="w3-container w3-flat-midnight-blue w3-round"><h3>${trip.title}</h3></header>
       <div class="w3-container">
       <p><strong>Reason:</strong> ${trip.reason}</p>
       <p><strong>Country:</strong> ${trip.country}</p>
       <p><strong>City:</strong> ${trip.city}</p>
       <p><strong>Latitude:</strong> ${trip.latitude}</p>
       <p><strong>Longitude:</strong> ${trip.longitude}</p>
       <p>${trip.description}</p>
       </div>
    `;
      leisureTripsElement.appendChild(div);
    });
  }
}

function loadLeisureTrips() {
  initCanvas();

  let xhr = new XMLHttpRequest();
  xhr.onerror = () =>
    displayMessage("Application error: cannot send request", "red");
  xhr.ontimeout = () => displayMessage("Application error: timeout", "red");
  xhr.onload = function () {
    let response = parseJson(xhr.responseText);
    if (xhr.status == 200 && response) {
      displayTrips(response.trips);
    } else {
      displayMessage(
        "Application error: cannot validate backend reply - " + xhr.status,
        "red"
      );
    }
  };
  xhr.open("GET", "backend.php", true);
  xhr.send();
}

function addTrip() {
  let { title, reason, country, city, latitude, longitude, description } =
    getInputElementValues();

  let xhr = new XMLHttpRequest();
  xhr.onerror = () =>
    displayMessage("Application error: cannot send request", "red");
  xhr.ontimeout = () => displayMessage("Application error: timeout", "red");
  xhr.onload = function () {
    let response = parseJson(xhr.responseText);
    if (xhr.status == 200 && response) {
      displayMessage(response.message, "green");
      loadLeisureTrips();
    } else {
      displayMessage(
        "Application error: cannot validate backend reply - " + xhr.status,
        "red"
      );
    }
  };

  let request = {
    title,
    reason,
    country,
    city,
    latitude,
    longitude,
    description,
  };

  xhr.open("POST", "backend.php", true);
  xhr.send(JSON.stringify(request));
}

document.addEventListener("DOMContentLoaded", addInputEventListeners);

// add eventlistener for each input reactive validation
function addInputEventListeners() {
  let inputElements = document.querySelectorAll("input, select, textarea");
  inputElements.forEach((input) => {
    input.addEventListener("input", function () {
      validateInput(this);
    });
  });
}

// validate each input reactive validation
function validateInput(inputElement) {
  if (!inputElement.checkValidity()) {
    displayMessage(
      inputElement.name + ": " + inputElement.validationMessage,
      "yellow"
    );
  } else {
    displayMessage("");
  }
}

function validateAllAndAdd() {
  // clear previous messages
  displayMessage("", "yellow");

  let inputElements = document.querySelectorAll("input, select, textarea");

  // validate each input element and append error messages
  inputElements.forEach((input) => {
    let inputElement = document.getElementById(input.id);
    if (!inputElement.checkValidity()) {
      message.innerText += `${inputElement.name}: ${inputElement.validationMessage}\n`;
    } else if (inputElement.value.trim() == "") {
      message.innerText += `${inputElement.name}: Can not be empty\n`;
    }
  });

  // if no validation messages are present, add the trip
  if (message.innerText.trim() == "") {
    addTrip();
  }
}

// translate real coordinated to canvas coordinates
function getCanvasCoordinates(latitude, longitude) {
  let canvas = document.getElementById("travel-map");

  let x = (longitude + 180) * (canvas.width / 360);
  let y = (90 - latitude) * (canvas.height / 180);

  return { x, y };
}

function initCanvas(trips) {
  let canvas = document.getElementById("travel-map");
  let ctx = canvas.getContext("2d");

  let img = new Image();
  img.src = "img/map.svg";

  img.onload = function () {
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    ctx.drawImage(this, 0, 0);

    ctx.fillStyle = "rgb(255,114,94)";
    ctx.fillRect(100, 2250, 100, 100);
    ctx.fillStyle = "black";
    ctx.font = "120px Arial";
    ctx.fillText("Leisure trips", 250, 2340);

    // add a circle for each saved trip
    if (trips) {
      trips.forEach((trip) => {
        let { x, y } = getCanvasCoordinates(
          parseFloat(trip.latitude),
          parseFloat(trip.longitude)
        );

        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgb(255,114,94)";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();
      });
    }
  };
}
