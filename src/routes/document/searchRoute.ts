import express from "express";
import { SearchController } from "../../controllers/searchController";
import { SearchService } from "../../services/searchService";
import { SearchRepository } from "../../repository/implementations/searchRepository";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import the logger

// Initialize repository, logger, and service
const searchRepository = new SearchRepository();
const logger = new ConsoleLogger(); // Create logger instance
const searchService = new SearchService(searchRepository, logger); // Inject logger into service

SearchController.setSearchService(searchService);

const router = express.Router();

router.get("/advancedSearch", SearchController.advancedSearch);

export default router;
