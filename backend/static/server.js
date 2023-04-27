import express from "express";
import homeRoutes from "../routes/home.js";
import requestTime from "../middleware/request-time.js";
import path from "path";
import testRoutes from "../routes/test/index.js";


import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.set( )

app.use(requestTime);
app.use(express.static(path.join("backend","static")));


app.use("/test", testRoutes);

app.use("/",homeRoutes);
app.use("/hiya",homeRoutes);


app.get("/", (_request, response) => {
  response.send("ehllo world");
});

app.listen(PORT, () =>{
  console.log("Server Started on port $(PORT)");
});