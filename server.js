const createError = require("http-errors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const rootRoutes = require("./backend/routes/root");

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((request, response, next) => {
  next(createError(404));
});
