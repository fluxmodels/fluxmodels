[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const OnChange: Event<OnChangeHandler>;
```

Defined in: [core/src/events/OnChange.ts:48](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L48)

Creates an event that fires whenever a state property changes.

Handlers must satisfy [OnChangeHandler](../type-aliases/OnChangeHandler.md).

## Returns

Event used to subscribe to state change notifications.

## Example

```ts
class CounterModel {
    count = 0

    @OnChange()
    handleChange(args: OnChangeArgs) {
        console.log(`${String(args.propName)} changed from`, args.prevValue, 'to', args.newValue)
    }
}

const CounterModel = {
    count: 0,
    handleChange: OnChange((args: OnChangeArgs) => {
        console.log('Changed prop:', args.propName)
    })
}
```
