[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const OnError: Event<OnErrorHandler>;
```

Defined in: [core/src/events/OnError.ts:52](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnError.ts#L52)

Creates an event that fires when an error occurs while mutating or resolving state.

Handlers must satisfy [OnErrorHandler](../type-aliases/OnErrorHandler.md).

## Returns

Event used to subscribe to error notifications.

## Example

```ts
class FormModel {
    error = ''

    @OnError()
    handleError(args: OnErrorArgs) {
        this.error = `Failed during ${args.errorPlace}: ${args.error.message}`
    }
}

const FormModel = {
    error: '',
    handleError: OnError((args: OnErrorArgs) => {
        console.error('State error', args.error)
    })
}
```
