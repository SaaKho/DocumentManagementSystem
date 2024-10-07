import express from "express";
import { PaginationController } from "../../controllers/paginationController";
import { PaginationService } from "../../services/paginationService";
import { PaginationRepository } from "../../repository/implementations/paginationRepository";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import the logger

const router = express.Router();

// Initialize repository, logger, and service, then inject into controller
const paginationRepository = new PaginationRepository();
const logger = new ConsoleLogger();
const paginationService = new PaginationService(paginationRepository, logger);

PaginationController.setPaginationService(paginationService);

// Route to paginate documents
router.get("/documents", PaginationController.getPaginatedDocuments);

// Route to paginate users
router.get("/users", PaginationController.getPaginatedUsers);

export default router;
