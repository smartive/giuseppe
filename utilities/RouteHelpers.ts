import { VersionInformation } from '../models/VersionInformation';

/**
 * Does compare two route version information to determine if the provided
 * version information is overlapping. Missing parameters are filled with infinity.
 * Algorithm: Not overlapping IF: until-1 < from-2 || from-1 > until-2
 * 
 * @returns {boolean} - true when the two routes are overlapping in some sort, otherwise false.
 */
export function doRouteVersionsOverlap(v1: VersionInformation, v2: VersionInformation): boolean {
    return (v1.until || Infinity) >= (v2.from || -Infinity) &&
        (v1.from || -Infinity) <= (v2.until || Infinity);
}
