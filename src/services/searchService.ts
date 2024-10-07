import { ISearchRepository } from "../repository/interfaces/Isearch.repository";
import { Logger } from "../logging/logger"; // Import the Logger interface

export class SearchService {
  private searchRepository: ISearchRepository;
  private logger: Logger; // Add logger

  constructor(searchRepository: ISearchRepository, logger: Logger) {
    this.searchRepository = searchRepository;
    this.logger = logger;
  }

  async advancedSearch(
    tags: string[],
    fileName?: string,
    contentType?: string
  ): Promise<any[]> {
    this.logger.log(
      `Performing advanced search with: tags=${tags}, fileName=${fileName}, contentType=${contentType}`
    );

    try {
      const results = await this.searchRepository.advancedSearch(
        tags,
        fileName,
        contentType
      );
      this.logger.log(`Search returned ${results.length} results`);
      return results;
    } catch (error: any) {
      this.logger.error(`Error during advanced search: ${error.message}`);
      throw error;
    }
  }
}
