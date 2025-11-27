[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function MODEL(): StateModel;
```

Defined in: [core/src/metatypes/MODEL.ts:70](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/MODEL.ts#L70)

Creates a dynamic property that returns the model object.

## Returns

[`StateModel`](../type-aliases/StateModel.md)

The metatype for reading the model object.

## Example

Usage example:

```ts
class User {
  model = MODEL()
}

class UserWithProfile extends User {
  name = ''
}

const [state] = StateManager.getOrCreateState(UserWithProfile, { key: 'user1' })
const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)

console.log(stateProxy.model) // UserWithProfile

```
