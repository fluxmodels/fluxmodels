[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function STORE(): StateStore;
```

Defined in: [core/src/metatypes/STORE.ts:74](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/STORE.ts#L74)

Creates a dynamic property that returns the StateStore instance where the state is stored.

## Returns

[`StateStore`](../classes/StateStore.md)

The metatype for reading the state's store.

## Example

Usage example:

```ts
class User {
  store = STORE()

  usersCount(){
    return this.store.findStates(User).length
  }
}

const MyComponent = (props) => {
  const [user] = useModel(User, { key: props.userId })

  return (
    <div>
      <h1>Users Count: {user.usersCount()}</h1>
    </div>
  )
}

```
