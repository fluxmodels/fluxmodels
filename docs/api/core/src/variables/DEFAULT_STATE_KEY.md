[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const DEFAULT_STATE_KEY: StateKey = '[[DefaultStateKey]]';
```

Defined in: [core/src/constants.ts:38](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/constants.ts#L38)

Sentinel key assigned when a state is stored without an explicit key.
`StateStore.addState` and `InjectModelImpl` rely on it to group states under a predictable default entry.
