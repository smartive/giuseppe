export type HandlableType<T> = Function | (new (...args: any[]) => T) | 'default';

export interface ReturnType<T> {
    type: HandlableType<T>;
    getHeaders(value: T): { [field: string]: string };
    getStatus(value: T): number;
    getValue(value: T): string;
}
