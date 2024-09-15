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
