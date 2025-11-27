[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type ObservablePropsArgs<T> = 
  | Iterable<keyof T>
  | { [K in keyof T]?: IsInjectedStateType<T[K]> extends true ? T[K] extends readonly (infer Item)[] ? ObservablePropsArgs<Item extends AnyRecord ? Item : AnyRecord> : ObservablePropsArgs<T[K]> : boolean };
```

Defined in: [core/src/types.ts:358](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L358)

Input accepted when configuring observable properties on a proxy.

The configuration can be a simple iterable of keys or a structured object that mirrors
nested state shape. Internal helpers convert this into [ObservableProps](ObservableProps.md).

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

The model shape represented by the proxy.

</td>
</tr>
</tbody>
</table>
