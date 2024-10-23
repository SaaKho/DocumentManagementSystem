import { Container } from "inversify";
import { DocumentService } from "../application/services/documentService";
import { ConsoleLogger } from "../infrastructure/logging/consoleLogger";
import { IDocumentRepository } from "../domain/interfaces/IDocument.Repository";
import { IUserRepository } from "../domain/interfaces/IUser.Repository";
import { DocumentRepository } from "../infrastructure/repository/documentRepository";
import { UserRepository } from "../infrastructure/repository/userRepository";
import { JwtAuthHandler } from "../infrastructure/auth/handlers/JWTAuthHandler";
import { AuthMiddleware } from "../presentation/middleware/authMiddleware";
import { DownloadService } from "../application/services/downloadService";
import { SearchService } from "../application/services/searchService";
import { SearchController } from "../presentation/controllers/searchController";
import { PermissionsService } from "../domain/services/permissionService";
import { PermissionsController } from "../presentation/controllers/permissionController";

const container = new Container();

// Bind repositories
container
  .bind<IDocumentRepository>("IDocumentRepository")
  .to(DocumentRepository);
container.bind<IUserRepository>("IUserRepository").to(UserRepository);

// Bind services
container.bind<ConsoleLogger>("Logger").to(ConsoleLogger);
container.bind<DocumentService>("DocumentService").to(DocumentService);
container.bind<DownloadService>("DownloadService").to(DownloadService);
container.bind<SearchService>("SearchService").to(SearchService);
container.bind<PermissionsService>("PermissionsService").to(PermissionsService);

// Bind auth handlers and middleware
container.bind<JwtAuthHandler>("JwtAuthHandler").to(JwtAuthHandler);
container.bind<AuthMiddleware>("AuthMiddleware").to(AuthMiddleware);

// Bind controllers
container.bind<SearchController>("SearchController").to(SearchController);
container
  .bind<PermissionsController>("PermissionsController")
  .to(PermissionsController);

export { container };
