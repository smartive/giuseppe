export interface ReturnType<T> {
    type: string;
    getHeaders(value: T): { [field: string]: string };
    getStatus(value: T): number;
    getValue(value: T): string;
}
