const express = require("express");
const path = require("path");

const app = express();
const port = 3000; // You can use any port that's not in use

// Serve static files from the 'public' directory (you can name this directory anything you like)
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
