/**
 * (static) Helper class. Helps build urls (sanitize urls, filter double slashes etc.).
 * 
 * @export
 * @static
 * @class UrlHelper
 */
export class UrlHelper {
    private constructor() { }

    /**
     * Builds an url by the given parts. All parts that are entered are first split with a '/' character.
     * Those segments are then processed (leading / removed, etc) and after that joined with slashes.
     * 
     * @static
     * @param {...string[]} parts 
     * @returns {string} 
     * @memberof UrlHelper
     */
    public static buildUrl(...parts: string[]): string {
        let segments: string[] = [];
        for (let x = 0; x < parts.length; x++) {
            if (parts[x] && parts[x].startsWith('/')) {
                parts[x] = parts[x].substring(1);
            }
        }

        for (const part of parts.filter(Boolean)) {
            segments = segments.concat(part.split('/'));
        }

        return segments.filter(Boolean).join('/');
    }
}
