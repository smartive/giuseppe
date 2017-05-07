export class UrlHelper {
    private constructor() { }

    public static buildUrl(...parts: string[]): string {
        for (let x = 0; x < parts.length; x++) {
            if (parts[x] && parts[x].startsWith('/')) {
                parts[x] = parts[x].substring(1);
            }
        }
        const url = parts.filter(Boolean).join('/'),
            index = url.lastIndexOf('~');

        if (index > -1) {
            const rootUrl = url.substring(index + 1);
            if (rootUrl.startsWith('/')) {
                return rootUrl.substring(1);
            }
            return rootUrl;
        }

        return url;
    }
}
