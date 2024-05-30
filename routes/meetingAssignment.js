import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createMeetingAssignment,
    deleteMeetingAssignment,
    editMeetingAssignment,
    getListOfMeetingAssignments,
} from "../controllers/meetingAssignment.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, getListOfMeetingAssignments);

router.post("/", isLoggedIn, createMeetingAssignment);

router.put("/:meetingAssignment_id", isLoggedIn, editMeetingAssignment);

router.delete('/:meetingAssignment_id', isLoggedIn, deleteMeetingAssignment)

export default router;
