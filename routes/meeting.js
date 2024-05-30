import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createMeeting,
    deleteMeeting,
    editMeeting,
    generateListOfMeetings,
    getListOfMeetingAssignmentsOfPreacher,
    getListOfMeetings,
} from "../controllers/meeting.js";
import { generateListOfAudioVideos, getListOfAudioVideos, loadAudioVideoAssignmentsOfPreacher } from "../controllers/audioVideo.js";
import { generateListOfOrdinals, getListOfOrdinals } from "../controllers/ordinals.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, getListOfMeetings);
router.get("/generate-pdf", generateListOfMeetings)
router.get("/preacher/assignments", isLoggedIn, getListOfMeetingAssignmentsOfPreacher);
router.get("/preacher/audioVideo/assignments", isLoggedIn, loadAudioVideoAssignmentsOfPreacher);
router.get("/audioVideo", isLoggedIn, getListOfAudioVideos)
router.get("/ordinals", isLoggedIn, getListOfOrdinals)
router.get("/audioVideo/generate-pdf", isLoggedIn, generateListOfAudioVideos)
router.get("/ordinals/generate-pdf", isLoggedIn, generateListOfOrdinals)

router.post("/", isLoggedIn, createMeeting);

router.put("/:meeting_id", isLoggedIn, editMeeting);

router.delete('/:meeting_id', isLoggedIn, deleteMeeting)

export default router;
