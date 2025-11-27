[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function KEY(): string;
```

Defined in: [core/src/metatypes/KEY.ts:65](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/KEY.ts#L65)

Creates a dynamic property that returns a key of the state.

## Returns

`string`

The metatype for reading the state's key.

## Example

Usage example:

```ts
class User {
  id = KEY()
}

const [state] = StateManager.getOrCreateState(User, { key: 'user1' })
const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)

console.log(stateProxy.id) // 'user1'

```
