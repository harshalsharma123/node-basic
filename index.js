const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users.js");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(bodyParser.json()); // to parse incoming JSON requests
// app.use(express.json()); // ✅ This parses incoming JSON bodies

// above both are same we you can use either one with some minor differences

app.use(cors()); // ✅ enable all CORS requests

app.use("/users", userRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});
