import express from "express";
const router = express.Router();

router.get("/",(_request,response)=>{
  response.send("hello world from route")
})

export default router;