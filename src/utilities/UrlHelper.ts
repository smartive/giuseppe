export class UrlHelper {
    private constructor() { }

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
