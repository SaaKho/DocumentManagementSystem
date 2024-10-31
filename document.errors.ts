import {
  GuardViolationError,
  NotFoundError,
  AlreadyExistsError,
  InvalidOperation,
  Omitt,
} from "@carbonteq/hexapp";

export class DocumentsSearchedFailed extends InvalidOperation {
  constructor() {
    super(`Document search failed`);
  }
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

