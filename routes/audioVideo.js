import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createAudioVideo,
    deleteAudioVideo,
    editAudioVideo,
} from "../controllers/audioVideo.js";

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, createAudioVideo);

router.put("/:audioVideo_id", isLoggedIn, editAudioVideo);

router.delete('/:audioVideo_id', isLoggedIn, deleteAudioVideo)

export default router;
