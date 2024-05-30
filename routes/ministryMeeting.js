import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createMinistryMeeting,
    deleteMinistryMeeting,
    editMinistryMeeting,
    generateListOfMinistryMeetings,
    getListOfMinistryMeetings,
    getListOfMinistryMeetingsOfPreacher,
} from "../controllers/ministryMeeting.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, getListOfMinistryMeetings);
router.get("/generate-pdf", isLoggedIn, generateListOfMinistryMeetings)
router.get("/preacher", isLoggedIn, getListOfMinistryMeetingsOfPreacher);

router.post("/", isLoggedIn, createMinistryMeeting);

router.put("/:ministryMeeting_id", isLoggedIn, editMinistryMeeting);

router.delete('/:ministryMeeting_id', isLoggedIn, deleteMinistryMeeting)

export default router;
