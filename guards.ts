export class Guard {
  static isEmpty(value: unknown): boolean {
    if (typeof value === "number" || typeof value === "boolean") {
      return false;
    }
    if (typeof value === "undefined" || value === null) {
      return true;
    }
    if (value instanceof Date) {
      return false;
    }
    if (value instanceof Object && !Object.keys(value).length) {
      return true;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return true;
      }
      if (value.every((item) => Guard.isEmpty(item))) {
        return true;
      }
    }
    if (value === "") {
      return true;
    }
    return false;
  }

  /**
   * Checks length range of a provided number/string/array.
   */
  static lengthIsBetween(
    value: number | string | Array<unknown>,
    min: number,
    max: number
  ): boolean {
    if (Guard.isEmpty(value)) {
      throw new Error(
        "Cannot check length of a value. Provided value is empty"
      );
    }
    const valueLength =
      typeof value === "number"
        ? Number(value).toString().length
        : value.length;
    return valueLength >= min && valueLength <= max;
  }

  /**
   * Checks if a string is a valid UUID.
   */
  static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Checks if a value is a valid email address.
   */
  static isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Checks if a value is within an allowed set of values (e.g., enum validation).
   */
  static isInAllowedValues<T>(value: T, allowedValues: T[]): boolean {
    return allowedValues.includes(value);
  }

  /**
   * Checks if a date is within a specified range.
   */
  static isDateInRange(date: Date, minDate: Date, maxDate: Date): boolean {
    return date >= minDate && date <= maxDate;
  }

  /**
   * Checks if a file path has an allowed file extension.
   */
  static hasAllowedExtension(
    filePath: string,
    allowedExtensions: string[]
  ): boolean {
    const fileExtension = filePath.split(".").pop();
    return allowedExtensions.includes(fileExtension || "");
  }

  /**
   * Checks if a tag name is valid (non-empty and within allowed length).
   */
  static isValidTagName(tagName: string, maxLength: number = 50): boolean {
    return !Guard.isEmpty(tagName) && tagName.length <= maxLength;
  }

  /**
   * Validates a permission type.
   */
  static isValidPermissionType(
    permissionType: string,
    allowedTypes: string[]
  ): boolean {
    return Guard.isInAllowedValues(permissionType, allowedTypes);
  }

  /**
   * Ensures a value is not empty and throws an error with a custom message if it is.
   */
  static againstEmpty(value: unknown, propertyName: string): void {
    if (Guard.isEmpty(value)) {
      throw new Error(`${propertyName} cannot be empty.`);
    }
  }

  /**
   * Ensures a value is a valid UUID.
   */
  static againstInvalidUUID(value: string, propertyName: string): void {
    if (!Guard.isValidUUID(value)) {
      throw new Error(`${propertyName} must be a valid UUID.`);
    }
  }

  /**
   * Ensures a value is a valid email address.
   */
  static againstInvalidEmail(value: string, propertyName: string): void {
    if (!Guard.isValidEmail(value)) {
      throw new Error(`${propertyName} must be a valid email address.`);
    }
  }

  /**
   * Ensures a value is within an allowed range of values.
   */
  static againstInvalidValue<T>(
    value: T,
    allowedValues: T[],
    propertyName: string
  ): void {
    if (!Guard.isInAllowedValues(value, allowedValues)) {
      throw new Error(
        `${propertyName} must be one of: ${allowedValues.join(", ")}`
      );
    }
  }

  /**
   * Ensures a string's length is within a range.
   */
  static againstInvalidLength(
    value: string,
    minLength: number,
    maxLength: number,
    propertyName: string
  ): void {
    if (!Guard.lengthIsBetween(value, minLength, maxLength)) {
      throw new Error(
        `${propertyName} must be between ${minLength} and ${maxLength} characters long.`
      );
    }
  }

  static againstInvalidFormat(
    value: string,
    regex: RegExp,
    errorMessage: string
  ): void {
    if (!regex.test(value)) {
      throw new Error(errorMessage);
    }
  }

  static againstLengthOutOfRange(
    value: string | unknown[],
    min: number,
    max: number,
    errorMessage: string
  ): void {
    const length =
      typeof value === "string" || Array.isArray(value) ? value.length : 0;
    if (length < min || length > max) {
      throw new Error(errorMessage);
    }
  }

  static againstInvalidEnumValue(
    value: unknown,
    enumType: object,
    errorMessage: string
  ): void {
    if (!Object.values(enumType).includes(value)) {
      throw new Error(errorMessage);
    }
  }
}
