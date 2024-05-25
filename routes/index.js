import express from "express";
import { authenticateCongregation, logOutCongregation, redirectToLogin, renderLoginForm, renderPrivacyPolicy } from "../controllers/index.js";

const router = express.Router({mergeParams: true});


router.get("/", redirectToLogin);
router.get("/logout", logOutCongregation);
router.get("/login", renderLoginForm);
router.get("/policy", renderPrivacyPolicy);

router.post("/login", authenticateCongregation);




export default router;