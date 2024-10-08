// Define a generic type `Either` that represents a value of one of two possible types:
// `Left` for errors and `Right` for success. This allows us to encapsulate both success
// and error cases within a single type.
export type Either<L, R> = Left<L> | Right<R>;

// Define the `Left` class, which represents a failure or error case in the `Either` monad.
// The generic type `L` is the type of the error (for example, a string for an error message).
export class Left<L> {
  // The `value` property holds the actual error data.
  constructor(public value: L) {}

  // `isLeft` is a type guard that tells TypeScript this instance is a `Left`.
  isLeft(): this is Left<L> {
    return true;
  }

  // `isRight` is a type guard that tells TypeScript this instance is not a `Right`.
  isRight(): this is Right<any> {
    return false;
  }
}

// Define the `Right` class, which represents a success case in the `Either` monad.
// The generic type `R` is the type of the successful result.
export class Right<R> {
  // The `value` property holds the actual success data.
  constructor(public value: R) {}

  // `isLeft` is a type guard that tells TypeScript this instance is not a `Left`.
  isLeft(): this is Left<any> {
    return false;
  }

  // `isRight` is a type guard that tells TypeScript this instance is a `Right`.
  isRight(): this is Right<R> {
    return true;
  }
}

// Helper function to easily create a `Left` instance representing a failure or error.
// This function returns an `Either<L, R>` where `L` is the error type, allowing chaining
// and error handling in a functional style.
export function left<L, R>(value: L): Either<L, R> {
  return new Left(value);
}

// Helper function to easily create a `Right` instance representing a successful result.
// This function returns an `Either<L, R>` where `R` is the success type, allowing chaining
// and functional handling of success cases.
export function right<L, R>(value: R): Either<L, R> {
  return new Right(value);
}

//Why Use Monads and Railway Oriented Programming (ROP)?
//Improved Error Handling:

//Using the Either monad, you can encapsulate success and error results without using exceptions. 
//This allows you to handle errors in a more controlled way, making the flow of data and errors explicit.
//Functions that might fail return an Either type, so the caller is forced to handle both success and error cases. 
//This reduces unexpected behavior and makes code safer by avoiding unhandled errors.

//Railway Oriented Programming (ROP):

//ROP is a functional pattern where each function in a chain operates on the success path unless an error occurs. 
//If an error is encountered, the chain stops, and the error propagates.
//By using Left and Right, you can build functions that continue down the “railway track” on success (Right)
// or switch to the error track (Left) on failure.
//This pattern is especially useful in complex operations where multiple steps depend on each other, 
//and each step might fail. ROP makes it easy to handle such chains, avoiding deeply nested error checks.
//Predictable Control Flow:

//The combination of monads and ROP leads to more predictable control flow, as you can always anticipate two possible 
//outcomes for each operation: success or failure.
//This approach minimizes surprises in your codebase. Instead of relying on exceptions 
//(which can be caught at unexpected places), Left and Right provide explicit paths for the computation, 
//making it clear what the function returns in each scenario.
