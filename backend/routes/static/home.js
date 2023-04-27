import express from "express";

const router = express.Router();

router.get("/",(_request, response)=>{
  const name=  "Team X";
  
  response.render("home",{title: "Team X term project",name});
})

router.get("/:id",)

export default router;