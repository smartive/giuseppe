/**
 * Error that is thrown when a version information on a route does overlap another route.
 *
 * @class VersionsOverlapError
 * @extends {Error}
 */
export class VersionsOverlapError extends Error {
    constructor(routeName: string) {
        super(`The method "${routeName}" has overlapping version information.`);
    }
}
