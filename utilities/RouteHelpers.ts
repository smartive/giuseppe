import { VersionInformation } from '../models/VersionInformation';

/**
 * Does compare two route version information to determine if the provided
 * version information is overlapping. Missing parameters are filled with infinity.
 * Algorithm: Not overlapping IF: until-1 < from-2 || from-1 > until-2
 * 
 * @returns {boolean} - true when the two routes are overlapping in some sort, otherwise false.
 */
export function doRouteVersionsOverlap(v1: VersionInformation, v2: VersionInformation): boolean {
    return v1 === v2 || (v1.until >= v2.from && v1.from <= v2.until);
}
