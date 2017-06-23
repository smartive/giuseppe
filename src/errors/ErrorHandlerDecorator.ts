import 'reflect-metadata';

import { Giuseppe } from '../Giuseppe';
import { ErrorHandlerFunction } from './ControllerErrorHandler';
import { ErrorHandlerWrongArgumentsError } from './ErrorHandlerWrongArgumentsError';
import { ErrorHandlerWrongArgumentTypesError } from './ErrorHandlerWrongArgumentTypesError';
import { ErrorHandlerWrongReturnTypeError } from './ErrorHandlerWrongReturnTypeError';

/**
 * Defines the length of the needed arguments for an error handler.
 */
const ARGUMENT_COUNT = 3;

/**
 * Reflect metadata key for error handler manager.
 * @type {string}
 */
export const ERRORHANDLER_KEY = 'giuseppe:errorHandler';

/**
 * Errorhandler decorator; decorates the given function as an error handler for the current controller.
 * You can specify various errors in the open parameter list. The handler is registered for the given error types,
 * and is only called if the thrown error matches the registered type. If errors are omitted, the handler will be
 * registered as 'default' and is called if no other specialized handler matches the thrown error.
 *
 * @param {...Error[]} errors List of error classes to register to.
 * @returns {(any, string, PropertyDescriptor) => void} Decorator for the class function.
 */
export function ErrorHandler(...errors: Function[]): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<ErrorHandlerFunction<Error>>) => {
        if (!descriptor.value) {
            throw new TypeError(`Errorhandler is undefined`);
        }

        const paramtypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        if (paramtypes.length !== ARGUMENT_COUNT) {
            throw new ErrorHandlerWrongArgumentsError();
        }

        [Object, Object].forEach((type, index) => {
            if (paramtypes[index] !== type) {
                throw new ErrorHandlerWrongArgumentTypesError();
            }
        });

        const returnValue = Reflect.getMetadata('design:returntype', target, propertyKey);
        if (!!returnValue) {
            throw new ErrorHandlerWrongReturnTypeError();
        }

        if (!errors.length) {
            errors.push(Error);
        }

        Giuseppe.registrar.registerErrorHandler(target, descriptor.value, errors);
    };
}
