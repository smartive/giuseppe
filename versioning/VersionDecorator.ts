import { VersionInformationInvalid, VersionInformationMissing } from '../errors/Errors';

function isDefined(value: any): boolean {
    return value !== null && value !== undefined;
}

/**
 * Version decorator; decorates a class or a method of a class as versioned.
 * When the routes are registered, the version information will determine
 * if a route is accessable or not. If a route is not available in a certain version
 * the system should return a 404.
 *
 * @param {{from: ?number, to: ?number}} versionInformation - An object with from and / or until information. If both are omitted, an error is thrown.
 * @returns {(Function) => void} - Decorator for a versioned controller or route.
 */
export function Version(versionInformation: { from?: number, until?: number }) {
    return (controllerOrRoute: any) => {
        if (!(isDefined(versionInformation.from) || isDefined(versionInformation.until))) {
            throw new VersionInformationMissing(controllerOrRoute.name);
        }

        if (isDefined(versionInformation.from) && (versionInformation.from.constructor !== Number || versionInformation.from < 1 || versionInformation.from % 1 !== 0)) {
            throw new VersionInformationInvalid(controllerOrRoute.name, `The from value (${versionInformation.from}) is either not a number, a floating point number or less than 1`);
        }

        if (isDefined(versionInformation.until) && (versionInformation.until.constructor !== Number || versionInformation.until < 1 || versionInformation.until % 1 !== 0)) {
            throw new VersionInformationInvalid(controllerOrRoute.name, `The until value (${versionInformation.until}) is either not a number, a floating point number or less than 1`);
        }

        if (isDefined(versionInformation.from) && isDefined(versionInformation.until) && versionInformation.from > versionInformation.until) {
            throw new VersionInformationInvalid(controllerOrRoute.name, `The from value (${versionInformation.from}) is greater than the until (${versionInformation.until})`);
        }

        console.log(controllerOrRoute);
    };
}
