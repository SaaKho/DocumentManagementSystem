import { Container } from 'inversify';
import { IDocumentRepository } from '../domain/interfaces/IDocument.Repository';
import { DocumentRepository } from '../infrastructure/repository/documentRepository';
import { ConsoleLogger } from '../infrastructure/logging/consoleLogger';
import { DocumentService } from '../application/services/documentService';
import { Logger } from '../infrastructure/logging/logger';

// Function to bind all dependencies
export const bindings = (container: Container) => {
  container.bind<IDocumentRepository>('IDocumentRepository').to(DocumentRepository);
  container.bind<Logger>('Logger').to(ConsoleLogger);
  container.bind<DocumentService>(DocumentService).toSelf();
};
