import {Router as route} from "express";

const router = route();
router.get("/", (req, res) => {
  return res.render("home");
});

export default router;
