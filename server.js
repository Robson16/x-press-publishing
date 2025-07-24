const bodyParser = require("body-parser");
const cors = require("cors");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const express = require("express");

const apiRouter = require("./api/api.js");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(errorhandler());

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;