import express from "express";
import { isLoggedIn } from "../helpers.js";
import { assignPreachersToHour, createCartDay, getCurrentCartDay, deleteCartDay, editCartDay, getListOfCartHoursOfPreacher, } from "../controllers/cartSchedule.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, getCurrentCartDay);
router.get("/cartDay/cartHours/preacher", isLoggedIn, getListOfCartHoursOfPreacher);

router.post("/cartDay", isLoggedIn, createCartDay);
router.post("/cartDay/cartHour/:cartHour_id/assignPreachers", isLoggedIn, assignPreachersToHour)

router.put("/cartDay/:cartDay_id", isLoggedIn, editCartDay);

router.delete('/cartDay/:cartDay_id', isLoggedIn, deleteCartDay)

export default router;
