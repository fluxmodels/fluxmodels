/**
 * Drives React Suspense by throwing/returning from a tracked promise.
 *
 * This helper marks the promise with a small state machine to avoid
 * re-subscribing on every render and throws the promise while pending
 * to let React show the fallback.
 *
 * @param promise - A thenable that will be tracked.
 * @param throwRealError - If true, rethrows the original error when rejected; otherwise returns `undefined`.
 * @returns The resolved value if already fulfilled, `undefined` when rejected and `throwRealError` is false.
 */
export function triggerReactSuspense<T>(
    promise: PromiseLike<T> & {
        status?: 'pending' | 'fulfilled' | 'rejected'
        value?: T
        reason?: unknown
    },
    throwRealError: boolean = true
): T | undefined {
    if (promise.status === 'pending') {
        throw promise
    } else if (promise.status === 'fulfilled') {
        return promise.value as T
    } else if (promise.status === 'rejected') {
        if (throwRealError) {
            throw promise.reason
        }

        return undefined
    } else {
        promise.status = 'pending'
        promise.then(
            (v: any) => {
                promise.status = 'fulfilled'
                promise.value = v
            },
            (e: Error) => {
                promise.status = 'rejected'
                promise.reason = e
            }
        )
        throw promise
    }
}
