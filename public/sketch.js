let myVideo;
let mySound;
let fft, amplitude;
let isPlaying = false;
let points = [];
let lastUpdateTime = 0;
let lastLineTime = 0;
let delaunay;
let offscreen;
let updateInterval = 2000;
let frameUpdateInterval = 10;
let lastUpdateFrame = 0;
let controlPoints = [];
let targetPoints = [];
let interpolationProgress = 0;
let squareVideoPixels = [];
let squareStates = [];
let frozenSquares = [];
let mvspeed;
let ptsToRender = 10;

function preload() {
  mySound = loadSound("mona_lisa.m4a");
}

function setup() {
  createCanvas(1100, 680);
  myVideo = createVideo(["mona_lisa.mov"]);
  myVideo.hide();

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  let playButton = createButton("Play");
  playButton.mousePressed(togglePlay);
  offscreen = createGraphics(width, height);
  for (let i = 0; i < ptsToRender; i++) {
    let newPoint = createVector(random(width), random(height));
    points.push(newPoint);
    let target = createVector(random(width), random(height));
    targetPoints.push(target);
    controlPoints.push(createVector(random(width), random(height))); // For bezier curves
  }
}

function togglePlay() {
  if (!isPlaying) {
    mySound.play();
    myVideo.loop();
    myVideo.volume(0);
    fft.setInput(mySound);
    isPlaying = true;
    lastUpdateTime = millis();
  } else {
    mySound.pause();
    myVideo.pause();
    isPlaying = false;
  }
  offscreen = createGraphics(width, height);
}

function draw() {
  background(0);
  fft.analyze();
  let bassVal = fft.getEnergy("bass");
  let lowMidVal = fft.getEnergy("lowMid");
  let midVal = fft.getEnergy("mid");
  let highMidVal = fft.getEnergy("highMid");
  if (myVideo.elt.readyState >= 2) {
    // Ensure video is ready
    image(myVideo, 0, 0, width, height);
    offscreen.image(myVideo, 0, 0, width, height);
    frozenSquares.forEach((frozen) => {
      push();
      // stroke(255, 0, 0);
      strokeWeight(0);
      // strokeWeight(0.5); // Border thickness
      noFill();
      rect(frozen.x - 11, frozen.y - 11, 22, 22);
      // Draw the frozen content
      image(frozen.image, frozen.x - 10, frozen.y - 10);
      pop();
    });
  }
  updateVideoPixelsForSquares();
  // Continuously draw and fill squares for each point
  points.forEach((point, index) => {
    drawSquareAtPoint(point, index);
    if (frameCount - lastUpdateFrame >= frameUpdateInterval) {
      fillSquareWithVideo(point);
    }
  });

  if (frameCount - lastUpdateFrame >= frameUpdateInterval) {
    lastUpdateFrame = frameCount;
  }

  if (isPlaying) {
    // Log the energy values for debugging purposes
    console.log(
      `Bass: ${bassVal}\nLowMid: ${lowMidVal}\nMid: ${midVal}\nHighMid: ${highMidVal}`,
    );

    // Calculate group size for point distribution among frequency bands
    let groupSize = points.length / 4; // Assuming points.length is divisible by 4

    updateTargetPoints();

    for (let i = 0; i < points.length; i++) {
      let speedFactor; // Declare variable for speed factor

      // Determine the group of the current point and set the speed factor accordingly
      if (i < groupSize) {
        speedFactor = bassVal / 10000; // Adjust this formula as needed for responsiveness
      } else if (i < groupSize * 2) {
        speedFactor = lowMidVal / 10000; // Adjust this formula as needed
      } else if (i < groupSize * 3) {
        speedFactor = midVal / 25000; // Adjust this formula as needed
      } else {
        speedFactor = highMidVal / 25000; // Adjust this formula as needed
      }
      points[i].lerp(targetPoints[i], speedFactor);
    }

    // Recalculate Delaunay triangulation based on new points positions
    let flatPoints = points.flatMap((p) => [p.x, p.y]);
    delaunay = Delaunator.from(flatPoints);

    // Draw visual elements
    drawDelaunayTriangles();
    drawCurves();
    drawOutline();
  }
}

function keyPressed() {
  if (keyCode === 32) {
    freezeSquares();
  }
  if (keyCode === 82) {
    frozenSquares = [];
  }
  if (keyCode === 84) {
    setNewTargets();
  }
  if (key === "e") {
    // remove a point from the array unless there are only 2 left
    if (points.length > 2) {
      points.pop();
    }
  }
  if (key === "w") {
    points.push(createVector(random(width), random(height)));
  }
}

function updatePoints() {
  points = [];
  for (let i = 0; i < 10; i++) {
    points.push(createVector(random(width), random(height)));
  }
  controlPoints = points.map((p) =>
    createVector(p.x + random(-50, 50), p.y + random(-50, 50)),
  );
  points.forEach(fillSquareWithVideo);
}

function updateControlPoints() {
  for (let i = 0; i < controlPoints.length; i++) {
    controlPoints[i].x += random(-1, 1);
    controlPoints[i].y += random(-1, 1);
  }
}
function drawCurves() {
  stroke(255);
  strokeWeight(1);

  for (let i = 0; i < points.length; i++) {
    let startPoint = points[i];
    let endPoint = points[(i + 1) % points.length];
    let controlPoint1 = controlPoints[i];
    let controlPoint2 = controlPoints[(i + 1) % controlPoints.length];

    noFill();
    bezier(
      startPoint.x,
      startPoint.y,
      controlPoint1.x,
      controlPoint1.y,
      controlPoint2.x,
      controlPoint2.y,
      endPoint.x,
      endPoint.y,
    );
    let curveLength = approximateBezierLength(
      startPoint,
      controlPoint1,
      controlPoint2,
      endPoint,
    );
    let midPoint = p5.Vector.lerp(startPoint, endPoint, 0.5);
    drawLengthText(curveLength, midPoint);
  }
}

function approximateBezierLength(p1, cp1, cp2, p2) {
  let steps = 10;
  let length = 0;
  let prevX = p1.x;
  let prevY = p1.y;
  for (let i = 1; i <= steps; i++) {
    let t = i / steps;
    let currX = bezierPoint(p1.x, cp1.x, cp2.x, p2.x, t);
    let currY = bezierPoint(p1.y, cp1.y, cp2.y, p2.y, t);
    length += dist(prevX, prevY, currX, currY);
    prevX = currX;
    prevY = currY;
  }
  return length;
}

function drawLengthText(length, position) {
  push();
  translate(position.x, position.y);
  fill(0, 255, 0);
  noStroke();
  textSize(12);
  textStyle(BOLDITALIC);
  textAlign(CENTER, CENTER);
  text(`${length.toFixed(2)}px`, 0, -10);
  pop();
}

function bezierLength(p1, cp1, cp2, p2) {
  let steps = 100;
  let length = 0;
  let prevX = p1.x;
  let prevY = p1.y;
  for (let i = 1; i <= steps; i++) {
    let t = i / steps;
    let currX = bezierPoint(p1.x, cp1.x, cp2.x, p2.x, t);
    let currY = bezierPoint(p1.y, cp1.y, cp2.y, p2.y, t);
    length += dist(prevX, prevY, currX, currY);
    prevX = currX;
    prevY = currY;
  }
  return length;
}

function drawDelaunayTriangles() {
  // Check if delaunay exists and has the 'triangles' property
  if (delaunay && delaunay.triangles) {
    let triangles = delaunay.triangles;
    for (let i = 0; i < triangles.length; i += 3) {
      // Make sure the points exist before trying to access them
      let p0 = points[triangles[i]];
      let p1 = points[triangles[i + 1]];
      let p2 = points[triangles[i + 2]];
      if (p0 && p1 && p2) {
        // Check if these points are not undefined
        stroke(255);
        strokeWeight(2);
        line(p0[0], p0[1], p1[0], p1[1]);
        line(p1[0], p1[1], p2[0], p2[1]);
        line(p2[0], p2[1], p0[0], p0[1]);
      }
    }
  }
}
function drawOutline() {
  stroke(255, 0, 0); // Set outline color
  strokeWeight(1); // Set outline stroke weight
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y); // Use vertex to connect points
  }
  endShape(CLOSE); // CLOSE to connect the last point to the first
}

function setNewTargets() {
  if (points.length > 0) {
    let coords = points.map((p) => [p.x, p.y]);
    delaunay = Delaunator.from(coords.flat());
  }
}

function updateTargetPoints() {
  let currentMillis = millis();
  if (currentMillis - lastUpdateTime > updateInterval) {
    for (let i = 0; i < targetPoints.length; i++) {
      targetPoints[i] = createVector(random(width), random(height));
    }
    lastUpdateTime = currentMillis;
  }
}

function drawPointsWithSquares() {
  points.forEach((point) => {
    push();
    noFill();
    stroke(255, 0, 0);
    rectMode(CENTER);
    rect(point.x, point.y, 20, 20);
    pop();
  });
}

function drawSquareAtPoint(point, index) {
  push();
  stroke(255, 0, 0); // Outline color
  rectMode(CENTER);
  rect(point.x, point.y - 20, 20, 20); // Draw above the point
  pop();

  // Check if we have video pixels for this square
  if (squareVideoPixels[index]) {
    // Draw the stored video pixels for this square
    image(squareVideoPixels[index], point.x - 10, point.y - 30); // Adjust as necessary
  }
}

// Modify fillSquareWithVideo to capture pixels without directly drawing them
function fillSquareWithVideo(point) {
  let videoPixels = offscreen.get(
    random(width - 20),
    random(height - 20),
    20,
    20,
  );
}

function updateVideoPixelsForSquares() {
  if (frameCount % frameUpdateInterval === 0) {
    squareVideoPixels = points.map((point) => {
      return offscreen.get(random(width - 20), random(height - 20), 20, 20);
    });
  }
}

function getSquareContent(point) {
  // Capture a 20x20 pixel area from the canvas at the square's position
  // Note: This might need adjustment based on how you're drawing squares
  return offscreen.get(point.x - 10, point.y - 10, 20, 20);
}

function freezeSquares() {
  points.forEach((point) => {
    let videoContent = getSquareContentFromRandomPart();
    frozenSquares.push({ x: point.x, y: point.y, image: videoContent });
    if (frozenSquares.length > 40) {
      frozenSquares.shift();
    }
  });
}

function getSquareContentFromRandomPart() {
  // Assuming the offscreen buffer contains the current video frame
  let randomX = random(width - 20);
  let randomY = random(height - 20);
  // Capture a 20x20 pixel area from a random position in the offscreen buffer
  return offscreen.get(randomX, randomY, 20, 20);
}

function setNewTargets() {
  targetPoints = points.map(() => createVector(random(width), random(height)));
}
