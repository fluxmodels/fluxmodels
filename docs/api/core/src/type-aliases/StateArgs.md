[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateArgs<T> = {
  disableValidation?: boolean;
  initialValues?: Partial<{ [K in WritableKeys<T> as IsInjectedStateType<T[K]> extends true ? never : T[K] extends (args: any[]) => any ? never : K extends symbol ? never : K]: T[K] }>;
  key?: StateKey;
  metaArgs?: MetaArgsType;
  store?: StateStore;
};
```

Defined in: [core/src/types.ts:256](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L256)

Configuration accepted when creating or retrieving a state via [StateManager](../classes/StateManager.md).

Use these options to override the storage location, assign initial values, or provide
metadata arguments for metatyper validation.

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

The model shape used to create the state.

</td>
</tr>
</tbody>
</table>

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Type</th>
<th>Description</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="disablevalidation"></a> `disableValidation?`

</td>
<td>

`boolean`

</td>
<td>

When set to `true`, skips metatyper validation for this state creation.

Useful when the model intentionally diverges from the declared metadata.

</td>
<td>

[core/src/types.ts:280](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L280)

</td>
</tr>
<tr>
<td>

<a id="initialvalues"></a> `initialValues?`

</td>
<td>

`Partial`\<`{ [K in WritableKeys<T> as IsInjectedStateType<T[K]> extends true ? never : T[K] extends (args: any[]) => any ? never : K extends symbol ? never : K]: T[K] }`\>

</td>
<td>

Plain object whose enumerable properties will be merged onto the created state.

Only writable, non-function, non-symbol properties are allowed.

</td>
<td>

[core/src/types.ts:266](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L266)

</td>
</tr>
<tr>
<td>

<a id="key"></a> `key?`

</td>
<td>

[`StateKey`](StateKey.md)

</td>
<td>

Explicit key to assign instead of using the model's default key.

</td>
<td>

[core/src/types.ts:258](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L258)

</td>
</tr>
<tr>
<td>

<a id="metaargs"></a> `metaArgs?`

</td>
<td>

`MetaArgsType`

</td>
<td>

Arguments forwarded to metatyper metadata handlers.

</td>
<td>

[core/src/types.ts:282](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L282)

</td>
</tr>
<tr>
<td>

<a id="store"></a> `store?`

</td>
<td>

[`StateStore`](../classes/StateStore.md)

</td>
<td>

Store instance that should hold the state (defaults to `StateStore.defaultStore`).

</td>
<td>

[core/src/types.ts:260](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L260)

</td>
</tr>
</tbody>
</table>
