let video;
let items;
let fonts = {};
let currentItem = 0;
let displayText = false;
let textX, textY;
let accumulatedWidths = []; // Stores the cumulative width at each lyric
let lyricObjects = [];
let texFont;
let connections = [];
let showConnections = false;

function preload() {
  texFont = loadFont("/texgyreheroscn-bold.otf");
  loadJSON("lyrics.json", (data) => {
    items = data;
    items.forEach((item) => {
      if (!fonts[item.font]) {
        fonts[item.font] = loadFont(item.font);
      }
    });
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createVideo(["/president.mp4"], videoLoaded);
  video.size(width, height);
  video.hide();
  video.speed(0.96);
  video.loop();
  textFont("Arial");
  textSize(32);

  // Initialize accumulated widths after textFont and textSize are set
  accumulatedWidths[0] = 0;
  for (let i = 1; i < items.length; i++) {
    accumulatedWidths[i] =
      accumulatedWidths[i - 1] + textWidth(items[i - 1].word) + 20;
  }

  // Initialize connections array after items are loaded and confirmed
  connections = new Array(items.length); // Ensure connections array is properly initialized
  connections.fill({ from: null, to: null }); // Fill with default values

  // Initialize lyric objects and connections
  items.forEach((item, index) => {
    if (!fonts[item.font]) {
      fonts[item.font] = loadFont(item.font);
    }
    lyricObjects.push({
      x: random(width),
      y: random(height),
      vx: random(-3, 3),
      vy: random(-3, 3),
      word: item.word,
      font: item.font,
      color: item.color,
      size: item.size,
    });

    // Set up default connections as placeholders
    connections[index] = { from: null, to: null };
  });

  // Establish circular connections between lyrics
  for (let i = 0; i < lyricObjects.length; i++) {
    let nextIndex = (i + 1) % lyricObjects.length; // Circular index
    connections[i].to = nextIndex;
    connections[nextIndex].from = i;
  }

  noLoop();
}

function videoLoaded() {
  // Placeholder if needed for additional setup after video is ready
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  textFont(texFont);
  // make text italic
  textStyle(ITALIC);
  textSize(24); // Set a different size for the horizontal line

  // Calculate the offset to center the current lyric
  let currentWidth = textWidth(items[currentItem].word) / 2;
  let startOffset = width / 2 - accumulatedWidths[currentItem] - currentWidth;

  // Draw all lyrics horizontally centered with the specific font
  for (let i = 0; i < items.length; i++) {
    let color = i === currentItem ? "red" : "gray";
    fill(color);
    text(items[i].word, startOffset + accumulatedWidths[i], height / 2);
  }

  textFont("Arial");
  textStyle(NORMAL);
  textSize(10);

  // Draw active lyric at a random position
  if (displayText) {
    let activeItem = items[currentItem];
    fill(activeItem.color);
    textSize(activeItem.size);
    textFont(fonts[activeItem.font]);
    text(activeItem.word, textX, textY);
  }

  // Draw bouncing lyrics
  lyricObjects.forEach((lyric, index) => {
    lyric.x += lyric.vx;
    lyric.y += lyric.vy;

    // Check for canvas boundaries to bounce
    if (lyric.x <= 0 || lyric.x >= width) lyric.vx *= -1;
    if (lyric.y <= 0 || lyric.y >= height) lyric.vy *= -1;

    fill(index === currentItem ? "red" : "gray");
    textSize(10);
    textFont(fonts[lyric.font]);
    text(lyric.word, lyric.x, lyric.y);
  });
  if (showConnections) {
    lyricObjects.forEach((lyric, index) => {
      if (connections[index].to !== null) {
        let targetIndex = connections[index].to;
        let targetLyric = lyricObjects[targetIndex];

        // Ensure stroke properties are set for each line
        stroke(255, 0, 0); // Red color for lines
        strokeWeight(0.25); // Set line weight
        line(lyric.x, lyric.y, targetLyric.x, targetLyric.y); // Draw line

        // Calculate and draw line length
        let lineLength = dist(lyric.x, lyric.y, targetLyric.x, targetLyric.y);
        let midX = (lyric.x + targetLyric.x) / 2;
        let midY = (lyric.y + targetLyric.y) / 2;
        noStroke(); // Disable stroke for text
        fill(255); // White color for text
        textFont(texFont);
        textSize(12); // Text size for line length
        text(`${Math.round(lineLength)}px`, midX, midY);
      }
    });
  }
}

function keyPressed() {
  if (key === "r") {
    showConnections = !showConnections; // Toggle display of connections
  }
  if (key === "e") {
    currentItem = (currentItem + 1) % items.length;
    textX = random(50, width - 50);
    textY = random(50, height - 50);
    displayText = true;
    loop();
  }
}

function mousePressed() {
  if (video && video.elt.paused) {
    video.loop();
    loop(); // Continue looping draw function when video is playing
  } else if (video) {
    video.pause();
    noLoop(); // Stop the draw loop when video is paused
  }
}
