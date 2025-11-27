[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const OnMount: Event<OnMountHandler>;
```

Defined in: [core/src/events/OnMount.ts:37](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnMount.ts#L37)

Creates an event that fires when a state proxy is mounted.

Handlers must satisfy [OnMountHandler](../type-aliases/OnMountHandler.md).

## Returns

Event used to subscribe to mount notifications.

## Example

```ts
class TodoListModel {
    items: string[] = []

    @OnMount()
    setupEffects({ context }: OnMountArgs) {
        console.log('Mounted with render context', context)
    }
}
```
