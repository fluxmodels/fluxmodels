[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const OnUnmount: Event<OnUnmountHandler>;
```

Defined in: [core/src/events/OnUnmount.ts:35](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnUnmount.ts#L35)

Creates an event that fires when a state proxy is unmounted.

Handlers must satisfy [OnUnmountHandler](../type-aliases/OnUnmountHandler.md).

## Returns

Event used to subscribe to unmount notifications.

## Example

```ts
class TodoListModel {
    @OnUnmount()
    teardown({ stateProxy }: OnUnmountArgs) {
        console.log('Unmounting proxy', stateProxy)
    }
}
```
