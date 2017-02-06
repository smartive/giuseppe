import { VersionInformationInvalid, VersionInformationMissing } from '../errors/Errors';

function isDefined(value: any): boolean {
    return value !== null && value !== undefined;
}

function isInvalid(value: any): boolean {
    return isDefined(value) && (value.constructor !== Number || value < 1 || value % 1 !== 0);
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

        if (isInvalid(versionInformation.from)) {
            throw new VersionInformationInvalid(name, `The from value (${versionInformation.from}) is either not a number, a floating point number or less than 1`);
        }

        if (isInvalid(versionInformation.until)) {
            throw new VersionInformationInvalid(name, `The until value (${versionInformation.until}) is either not a number, a floating point number or less than 1`);
        }

        if (isDefined(versionInformation.from) && isDefined(versionInformation.until) && versionInformation.from > versionInformation.until) {
            throw new VersionInformationInvalid(name, `The from value (${versionInformation.from}) is greater than the until (${versionInformation.until})`);
        }

        return new VersionInformation(versionInformation.from || -Infinity, versionInformation.until || Infinity);
    }

    public isInVersionBounds(requestedVersion: number): boolean {
        return this.from <= requestedVersion && requestedVersion <= this.until;
    }

    public toString(): string {
        return `${this.from.toString()}|${this.until.toString()}`;
    }

    private constructor(public from: number, public until: number) { }
}
