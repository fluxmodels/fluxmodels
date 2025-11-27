[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const DefaultStoreSymbol: typeof DefaultStoreSymbol;
```

Defined in: [core/src/constants.ts:15](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/constants.ts#L15)

Global key used by `StateStore.defaultStore` to cache the singleton store on `globalThis`.
The symbol ensures the default store instance is shared safely across module boundaries.
