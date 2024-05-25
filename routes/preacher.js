import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    confirmDeletingPreacher,
    createPreacher,
    deletePreacher,
    editPreacher,
    getInfoAboutPreacher,
    renderListOfPreachers,
    renderNewPreacherForm,
    renderPreacherEditForm,
    searchPreachers,
} from "../controllers/preacher.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, renderListOfPreachers);
router.get("/new", isLoggedIn, renderNewPreacherForm);
router.get("/:preacher_id/edit", isLoggedIn, renderPreacherEditForm);
router.get("/:preacher_id/delete", isLoggedIn, confirmDeletingPreacher);
router.get("/search", isLoggedIn, searchPreachers);
router.get("/:preacher_id", isLoggedIn, getInfoAboutPreacher);

router.post("/", isLoggedIn, createPreacher);

router.put("/:preacher_id", isLoggedIn, editPreacher);

router.delete('/:preacher_id', isLoggedIn, deletePreacher)

export default router;
