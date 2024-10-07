import { PaginationRepository } from "../repository/implementations/paginationRepository";
import { Logger } from "../logging/logger"; // Import the Logger interface

export class PaginationService {
  private paginationRepository: PaginationRepository;
  private logger: Logger;

  constructor(paginationRepository: PaginationRepository, logger: Logger) {
    this.paginationRepository = paginationRepository;
    this.logger = logger;
  }

  // Fetch paginated documents using repository
  async getPaginatedDocuments(page: number, limit: number) {
    this.logger.log(
      `Fetching paginated documents for page: ${page}, limit: ${limit}`
    );
    const paginatedData = await this.paginationRepository.getPaginatedDocuments(
      page,
      limit
    );
    return {
      data: paginatedData.data,
      currentPage: page,
      totalPages: Math.ceil(paginatedData.totalItems / limit),
      totalItems: paginatedData.totalItems,
    };
  }

  // Fetch paginated users using repository
  async getPaginatedUsers(page: number, limit: number) {
    this.logger.log(
      `Fetching paginated users for page: ${page}, limit: ${limit}`
    );
    const paginatedData = await this.paginationRepository.getPaginatedUsers(
      page,
      limit
    );
    return {
      data: paginatedData.data,
      currentPage: page,
      totalPages: Math.ceil(paginatedData.totalItems / limit),
      totalItems: paginatedData.totalItems,
    };
  }
}
