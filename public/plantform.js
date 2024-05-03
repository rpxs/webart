let video;
let data = [];
let currentPoints = [];
let connections = [];
let controlPoints = []; // Store control points for each connection
let currentIndex = 0;
let lastControlUpdate = 0;
let lastShuffleTime = 0;
let controlUpdateInterval = 2;
let shuffleInterval = 250;
let texFont;
let sampledColors = []; // Array to hold sampled colors
let numSampledColors = 200;
let isVisible = true;
let isFullscreen = true;

function preload() {
  texFont = loadFont("/texgyreheroscn-bold.otf");
  data = loadJSON("/coordsflwr.json", dataLoaded);
}

function dataLoaded(loadedData) {
  data = loadedData;
  console.log("Data Loaded: ", data);
}

function setup() {
  createCanvas(
    isFullscreen ? windowWidth : 800,
    isFullscreen ? windowHeight : 800,
  );
  video = createVideo(["/media/flwrs.mp4"], videoLoaded);
  video.size(width, height); // Set video size to match canvas size
  video.hide();
  frameRate(30);
  setInterval(refreshSampledColors, 1000);
}

function videoLoaded() {
  video.play();
  video.volume(1);
  waitForVideo();
}

function waitForVideo() {
  if (video.time() > 0 && video.loadedmetadata) {
    // Check if video has started playing and metadata is loaded
    setTimeout(sampleColors, 500); // Wait a bit longer even after video starts to ensure frames are ready
  } else {
    setTimeout(waitForVideo, 100); // Keep checking every 100ms
  }
}

function refreshSampledColors() {
  if (video.time() > 0 && video.loadedmetadata) {
    // Ensure video is ready
    sampleColors(); // Re-sample colors
  }
}

function sampleColors() {
  video.loadPixels(); // Ensure pixels are loaded
  if (video.pixels.length > 0) {
    sampledColors = []; // Clear previous colors
    for (let i = 0; i < numSampledColors; i++) {
      let x = int(random(video.width));
      let y = int(random(video.height));
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      let newColor = color(r, g, b);
      if (newColor.levels[0] + newColor.levels[1] + newColor.levels[2] >= 100) {
        sampledColors.push(newColor);
      }
    }
    console.log("Colors sampled:", sampledColors.length); // Log the number of colors successfully sampled
  } else {
    console.error("Failed to load pixels, retrying...");
  }
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  if (
    currentIndex < data.length &&
    video.time() >= data[currentIndex].timestamp
  ) {
    if (video.time() > data[currentIndex].timestamp + 0.1) {
      currentIndex++;
      if (currentIndex < data.length) {
        updatePoints();
      }
    }
  }

  if (millis() - lastControlUpdate > controlUpdateInterval) {
    updateControlPoints(); // Update control points less frequently
    lastControlUpdate = millis();
  }

  if (millis() - lastShuffleTime > shuffleInterval) {
    shuffleConnections();
    lastShuffleTime = millis();
  }

  drawPointsAndLines();
}

function updatePoints() {
  if (currentIndex < data.length) {
    let currentData = data[currentIndex];
    currentPoints = currentData.arr;
    prepareConnections();
    updateControlPoints(); // Initialize control points
  }
}

function prepareConnections() {
  connections = [];
  for (let i = 0; i < currentPoints.length; i++) {
    let start = currentPoints[i];
    let end = currentPoints[(i + 1) % currentPoints.length];
    connections.push({ start, end });
  }
}

function updateControlPoints() {
  controlPoints = connections.map(({ start, end }) => ({
    control1: { x: start[0] + random(-50, 50), y: start[1] + random(-50, 50) },
    control2: { x: end[0] + random(-50, 50), y: end[1] + random(-50, 50) },
  }));
}

function shuffleConnections() {
  let shuffledIndices = shuffle(Array.from(Array(currentPoints.length).keys()));
  connections = [];
  controlPoints = []; // Reset control points as well
  for (let i = 0; i < shuffledIndices.length; i++) {
    let start = currentPoints[shuffledIndices[i]];
    let end = currentPoints[shuffledIndices[(i + 1) % currentPoints.length]];
    connections.push({ start, end });
    // Re-initialize control points for new connections
    updateControlPoints();
  }
}

function drawPointsAndLines() {
  if (sampledColors.length === 0) {
    console.error("Attempted to draw lines but colors are not yet sampled.");
    return; // Skip drawing if colors are not ready
  }
  if (isVisible) {
    connections.forEach(({ start, end }, index) => {
      const { control1, control2 } = controlPoints[index];
      let col = random(sampledColors);
      stroke(col);
      strokeWeight(1.25);
      noFill();
      bezier(
        start[0],
        start[1],
        control1.x,
        control1.y,
        control2.x,
        control2.y,
        end[0],
        end[1],
      );
      let t = 0.5; // Midpoint on the bezier curve
      let Bx = bezierPoint(start[0], control1.x, control2.x, end[0], t);
      let By = bezierPoint(start[1], control1.y, control2.y, end[1], t);
      let length = dist(start[0], start[1], end[0], end[1]).toFixed(1);
      fill(255);
      noStroke();
      textFont(texFont);
      textSize(9);
      textAlign(CENTER, CENTER);
      text(`${length}px`, Bx, By);
    });
    noFill();
    stroke(255, 255, 255);
    strokeWeight(1.25);
    currentPoints.forEach((point) => {
      ellipse(point[0], point[1], 1, 1);
    });
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    isVisible = !isVisible; // Toggle visibility
  }
  if (key === "t" || key === "T") {
    // Toggle fullscreen mode
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      resizeCanvas(windowWidth, windowHeight);
    } else {
      resizeCanvas(800, 800); // Set size back to 800x800 when not fullscreen
    }
    video.size(width, height); // Adjust video size to new canvas size
  } else if (key === "e" || key === "E") {
    // Toggle video playback
    if (video.elt.paused) {
      video.play();
    } else {
      video.pause();
      console.log("Video paused at:", video.time(), "s");
    }
  }
}
