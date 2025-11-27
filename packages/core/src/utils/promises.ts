/**
 * Lightweight check whether a value behaves like a Promise (thenable/catch/finally).
 *
 * @param x - Value to check.
 * @returns Whether the value looks like a promise.
 */
export const isPromiseLike = <T>(x: T): boolean =>
    typeof (x as any)?.then === 'function' &&
    typeof (x as any)?.catch === 'function' &&
    typeof (x as any)?.finally === 'function'
