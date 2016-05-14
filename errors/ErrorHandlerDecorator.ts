import 'reflect-metadata';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongReturnTypeError,
    ErrorHandlerWrongArgumentTypesError
} from './Errors';
import {ControllerErrorHandler} from './ControllerErrorHandler';

const ARGUMENT_COUNT = 3;

/**
 * Reflect metadata key for error handler manager.
 * @type {string}
 */
export const ERRORHANDLER_KEY = 'errorHandler';

/**
 * Errorhandler decorator; decorates the given function as an error handler for the current controller.
 * You can specify various errors in the open parameter list. The handler is registered for the given error types,
 * and is only called if the thrown error matches the registered type. If errors are omitted, the handler will be
 * registered as 'default' and is called if no other specialized handler matches the thrown error.
 *
 * @param {...Error[]} errors - List of error classes to register to.
 * @returns {(any, string, PropertyDescriptor) => void} - Decorator for the class function.
 */
export function ErrorHandler(...errors: Function[]) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let paramtypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        if (paramtypes.length !== ARGUMENT_COUNT) {
            throw new ErrorHandlerWrongArgumentsError();
        }

        [Object, Object].forEach((type, index) => {
            if (paramtypes[index] !== type) {
                throw new ErrorHandlerWrongArgumentTypesError();
            }
        });

        let returnValue = Reflect.getMetadata('design:returntype', target, propertyKey);
        if (!!returnValue) {
            throw new ErrorHandlerWrongReturnTypeError();
        }

        let handler: ControllerErrorHandler = Reflect.getMetadata(ERRORHANDLER_KEY, target.constructor) || new ControllerErrorHandler();
        if (errors.length) {
            errors.forEach(e => handler.addHandler(descriptor.value, e));
        } else {
            handler.addHandler(descriptor.value);
        }
        Reflect.defineMetadata(ERRORHANDLER_KEY, handler, target.constructor);
    };
}
