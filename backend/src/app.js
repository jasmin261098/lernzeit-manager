const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Lernzeit-Manager API läuft 🚀" });
});

app.listen(3000, () => {
  console.log("Backend läuft auf http://localhost:3000");
});