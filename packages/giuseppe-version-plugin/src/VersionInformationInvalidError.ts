/**
 * Error that is thrown when a version information contains errors.
 * (Error will happen at startup)
 *
 * @class VersionInformationInvalidError
 * @extends {Error}
 */
export class VersionInformationInvalidError extends Error {
    constructor(routeName: string, reason: string) {
        super(`The controller or method "${routeName}" has invalid version information.\nReason: ${reason}`);
    }
}
