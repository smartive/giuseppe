/**
 * Error that is thrown when a version information on a route or a controller is missing both information,
 * i.e. there is no version in "from" and no version in "until".
 * (Error will happen at startup)
 *
 * @class VersionInformationMissing
 * @extends {Error}
 */
export class VersionInformationMissingError extends Error {
    constructor(routeName: string) {
        super(`The controller or method "${routeName}" has neither from nor until version information.`);
    }
}
