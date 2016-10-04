import { VersionInformationInvalid, VersionInformationMissing } from '../errors/Errors';

function isDefined(value: any): boolean {
    return value !== null && value !== undefined;
}

/**
 * Defines version information for a controller or a route. Throws if there are errors with the information.
 * 
 * @class VersionInformation
 */
export class VersionInformation {
    public static create(name: string, versionInformation: { from?: number, until?: number }): VersionInformation {
        if (!(isDefined(versionInformation.from) || isDefined(versionInformation.until))) {
            throw new VersionInformationMissing(name);
        }

        if (isDefined(versionInformation.from) && (versionInformation.from.constructor !== Number || versionInformation.from < 1 || versionInformation.from % 1 !== 0)) {
            throw new VersionInformationInvalid(name, `The from value (${versionInformation.from}) is either not a number, a floating point number or less than 1`);
        }

        if (isDefined(versionInformation.until) && (versionInformation.until.constructor !== Number || versionInformation.until < 1 || versionInformation.until % 1 !== 0)) {
            throw new VersionInformationInvalid(name, `The until value (${versionInformation.until}) is either not a number, a floating point number or less than 1`);
        }

        if (isDefined(versionInformation.from) && isDefined(versionInformation.until) && versionInformation.from > versionInformation.until) {
            throw new VersionInformationInvalid(name, `The from value (${versionInformation.from}) is greater than the until (${versionInformation.until})`);
        }

        return new VersionInformation(versionInformation.from, versionInformation.until);
    }

    private constructor(public from?: number, public until?: number) { }
}
