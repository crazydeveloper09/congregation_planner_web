import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    confirmDeletingMinistryGroup,
    createMinistryGroup,
    deleteMinistryGroup,
    editMinistryGroup,
    generateListOfMinistryGroups,
    renderNewMinistryGroupForm,
    renderMinistryGroupEditForm,
} from "../controllers/ministryGroup.js";

const router = express.Router({ mergeParams: true });

router.get("/generate-pdf", isLoggedIn, generateListOfMinistryGroups);
router.get("/new", isLoggedIn, renderNewMinistryGroupForm);
router.get("/:ministryGroup_id/edit", isLoggedIn, renderMinistryGroupEditForm);
router.get("/:ministryGroup_id/delete", isLoggedIn, confirmDeletingMinistryGroup);

router.post("/", isLoggedIn, createMinistryGroup);

router.put("/:ministryGroup_id", isLoggedIn, editMinistryGroup);

router.delete('/:ministryGroup_id', isLoggedIn, deleteMinistryGroup)

export default router;
