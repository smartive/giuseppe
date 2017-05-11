export class NoReturnValueHandlerFoundError extends Error {
    constructor(value: any) {
        super(`There is no return type handler registered for the value ${value} (constructor: ${value.constructor.name})`);
    }
}
