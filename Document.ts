// src/entities/Document.ts
import {
  GuardViolationError,
  BaseEntity,
  DateTime,
  IEntity,
  SimpleSerialized,
  NotFoundError,
  AlreadyExistsError,
  InvalidOperation,
  Omitt,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";

export interface IDocument extends IEntity {
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[];
  filePath: string;
}

export class DocumentDoesNotHaveFilename extends GuardViolationError {
  constructor() {
    super(`Document must have a file name.`);
  }
}
export class DocumentNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Document with id: ${id} not found`);
  }
}
export class DocumentAlreadyExistsError extends AlreadyExistsError {
  constructor(id: string) {
    super(`Document with id: ${id} already Exists`);
  }
}
export class DocumentPermissionError extends InvalidOperation {
  constructor(id: string) {
    super(`Document with id: ${id} already Exists`);
  }
}
export class DocumentUpdateError extends InvalidOperation {
  constructor(id: string) {
    super(`Document with id: ${id} cannot be updated`);
  }
}

export type DocumentData = Omitt<IDocument, keyof IEntity>;

export type updateDocumentData = Partial<IDocument>;

export type SerializeDocument = SimpleSerialized<IDocument>;

export class Document extends BaseEntity implements IDocument {
  constructor(
    readonly fileName: string,
    readonly fileExtension: string,
    readonly contentType: string,
    readonly tags: string[] = [],
    readonly filePath: string = ""
  ) {
    super();
    this.fileName = fileName;
    this.fileExtension = fileExtension;
    this.contentType = contentType;
    this.tags = tags;
    this.filePath = filePath;
  }

  //update method
  update(
    data: updateDocumentData
  ): Result<Document, DocumentDoesNotHaveFilename> {
    return this.ensureFilenameExists().map(() => {
      const updated = {
        ...this.serialize(),
        ...data,
      };
      return Document.fromSerialized(updated);
    });
  }

  // Deserialize the entity
  static fromSerialized(data: SerializeDocument): Document {
    const entity = new Document(
      data.fileName,
      data.fileExtension,
      data.contentType,
      data.tags,
      data.filePath
    );
    entity._fromSerialized(data);
    return entity;
  }

  // Serialize the entity for transfer
  serialize() {
    return {
      ...this._serialize(),
      fileName: this.fileName,
      fileExtension: this.fileExtension,
      contentType: this.contentType,
      tags: this.tags,
      filePath: this.filePath,
    };
  }
  ensureFilenameExists(): Result<this, DocumentDoesNotHaveFilename> {
    if (!this.fileName || this.fileName.trim().length === 0)
      return Result.Err(new DocumentDoesNotHaveFilename());
    return Result.Ok(this);
  }
}

//suggestions for further changes
//add fromSerialise waala part
//
