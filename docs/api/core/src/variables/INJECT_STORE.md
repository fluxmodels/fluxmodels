[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const INJECT_STORE: typeof INJECT_STORE;
```

Defined in: [core/src/constants.ts:26](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/constants.ts#L26)

Marker value for `InjectModel` configurations that should reuse the parent state's store.
When encountered, `InjectModelImpl` replaces it with the store resolved from `StateManager.instance()`.
