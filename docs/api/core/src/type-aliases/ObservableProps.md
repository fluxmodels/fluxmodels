[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type ObservableProps = {
[K: string]: boolean | ObservableProps;
};
```

Defined in: [core/src/types.ts:346](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L346)

Normalized map indicating which properties of a state proxy should be observed.

Values can be booleans or nested structures to express deep observability preferences.
When properties are included in this map, changes to them trigger reactivity, causing
mount handlers (rerender functions) to be invoked.

Observable properties can be specified explicitly during proxy mounting via [StateProxyArgs](StateProxyArgs.md).
Additionally, when `autoResolveObservableProps` is set to `true`, reading properties from the
state proxy will automatically add them to the observable properties map, enabling automatic
reactivity tracking based on actual property access patterns.

## Index Signature

```ts
[K: string]: boolean | ObservableProps
```
