const { PORT } = require("./src/config/env");
const express = require("express");
const app = express();
const router = require("./src/routes/routes");
app.use(express.json());
app.use(express.static("public"));

app.use("/tasks", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on PORT `, PORT);
});
