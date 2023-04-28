const express = require("express");

const app = express();
const port = 5000;

const connectToMongo = require("./db");
connectToMongo();

// It parses incoming requests with JSON payloads
app.use(express.json())

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));


app.listen(port, () => console.log(`app listening on port ${port}`));
