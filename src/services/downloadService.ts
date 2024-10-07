import { IDownloadRepository } from "../repository/interfaces/Idownload.repository";
import { Logger } from "../logging/logger";

export class DownloadService {
  private downloadRepository: IDownloadRepository;
  private logger: Logger;

  constructor(downloadRepository: IDownloadRepository, logger: Logger) {
    this.downloadRepository = downloadRepository;
    this.logger = logger;
  }

  async generateDownloadLink(
    protocol: string,
    host: string,
    filename: string
  ): Promise<string> {
    this.logger.log(`Generating download link for file: ${filename}`);
    return this.downloadRepository.generateDownloadLink(
      protocol,
      host,
      filename
    );
  }

  async serveFileByToken(token: string): Promise<string> {
    try {
      this.logger.log(`Serving file for token: ${token}`);
      return this.downloadRepository.serveFileByToken(token);
    } catch (error: any) {
      this.logger.error(
        `Error serving file for token: ${token} - ${error.message}`
      );
      throw error;
    }
  }
}
