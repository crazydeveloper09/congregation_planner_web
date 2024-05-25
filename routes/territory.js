import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    assignTerritory,
    confirmDeletingTerritory,
    createTerritory,
    deleteCheckout,
    deleteTerritory,
    editCheckout,
    editTerritory,
    makeTerritoryFreeAgain,
    renderCheckoutEditForm,
    renderListOfAllTerritories,
    renderListOfAvailableTerritories,
    renderNewTerritoryForm,
    renderTerritoryEditForm,
    renderTerritoryHistory,
    searchAllTerritories,
    searchAvailableTerritories,
    searchChangesByDate,
} from "../controllers/territory.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, renderListOfAllTerritories);
router.get("/available", isLoggedIn, renderListOfAvailableTerritories);
router.get("/new", isLoggedIn, renderNewTerritoryForm);
router.get("/search", isLoggedIn, searchAllTerritories);
router.get("/dateChanges", isLoggedIn, searchChangesByDate);
router.get("/:territory_id/edit", isLoggedIn, renderTerritoryEditForm);
router.get("/:territory_id", isLoggedIn, renderTerritoryHistory);
router.get("/:territory_id/delete", isLoggedIn, confirmDeletingTerritory);
router.get("/available/search", isLoggedIn, searchAvailableTerritories);
router.get("/:territory_id/checkouts/:checkout_id/edit", isLoggedIn, renderCheckoutEditForm);
router.get("/:territory_id/checkouts/:checkout_id/delete", isLoggedIn, deleteCheckout);

router.post("/", isLoggedIn, createTerritory);
router.post("/:territory_id/assign", isLoggedIn, assignTerritory);
router.post("/:territory_id/makeFree", isLoggedIn, makeTerritoryFreeAgain);

router.put("/:territory_id", isLoggedIn, editTerritory);
router.put("/:territory_id/checkouts/:checkout_id", isLoggedIn, editCheckout);

router.delete("/:territory_id", isLoggedIn, deleteTerritory)

export default router;
