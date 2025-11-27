[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function getKey(state: AnyRecord): string;
```

Defined in: [core/src/utils/stateinfo.ts:24](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/utils/stateinfo.ts#L24)

Returns the key of the state.

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

`string`

The key of the state.

## Example

```ts
class UserModel {
    username = '',

    get key() {
        return getKey(this)
    }
}

const [userState] = StateManager.getOrCreateState(UserModel, { key: 1 })
console.log(getKey(userState)) // 1
```
