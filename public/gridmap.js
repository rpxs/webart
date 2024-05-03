let video;
let allCoords = [];
let currentArray = 0;
let videoReady = false; // Flag to check if the video is ready to play

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createVideo(["/media/flwrs.mp4"], videoLoaded);
  video.hide(); // Hide HTML video element controls
  textAlign(CENTER, CENTER);
  textSize(24);
}

function videoLoaded() {
  console.log("Video loaded. Press 'E' to play.");
  videoReady = true; // Set video as ready
  video.oncanplaythrough = () => {
    // Ensure video can play through without interruption
    videoReady = true;
    console.log("Video can play through.");
  };
  // Do not automatically play the video
}

function draw() {
  background(220);
  if (videoReady && !video.elt.paused) {
    image(video, 0, 0, width, height); // Draw video on the canvas only if playing
  } else {
    text("Press 'E' to play the video.", width / 2, height / 2); // Display message to play video
  }

  if (videoReady) {
    // Draw coordinates only if the video is ready
    allCoords.forEach((coordObj, index) => {
      if (index === currentArray) {
        fill(255, 0, 0);
        noStroke();
        coordObj.arr.forEach((point) => {
          ellipse(point[0], point[1], 5, 5);
        });
      }
    });
  }
}

function keyPressed() {
  if (key === "e" || key === "E") {
    if (videoReady) {
      if (video.elt.paused) {
        video.play(); // Play video only on 'E' and if it's paused
      } else {
        video.pause(); // Pause if it's playing
      }
    }
  } else if (key === "r" || key === "R") {
    currentArray++;
    allCoords[currentArray] = { arr: [], timestamp: video.time() };
  }
}

function doubleClicked() {
  let fs = fullscreen();
  fullscreen(!fs);
  resizeCanvas(windowWidth, windowHeight);
}
