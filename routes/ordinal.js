import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createOrdinal,
    deleteOrdinal,
    editOrdinal,
} from "../controllers/ordinals.js";

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, createOrdinal);

router.put("/:ordinal_id", isLoggedIn, editOrdinal);

router.delete('/:ordinal_id', isLoggedIn, deleteOrdinal)

export default router;
