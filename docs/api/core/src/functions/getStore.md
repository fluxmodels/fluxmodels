[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function getStore(state: AnyRecord): StateStore;
```

Defined in: [core/src/utils/stateinfo.ts:48](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/utils/stateinfo.ts#L48)

Returns the store of the state.

Example:
```ts
class UserModel {
    username = '',

    get store() {
        return getStore(this)
    }
}

const [userState] = StateManager.getOrCreateState(UserModel)
console.log(getStore(userState)) // StateStore.defaultStore
```

## Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

[`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
<td>

The state object.

</td>
</tr>
</tbody>
</table>

## Returns

[`StateStore`](../classes/StateStore.md)

The store of the state.
