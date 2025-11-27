[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const INJECT_KEY: typeof INJECT_KEY;
```

Defined in: [core/src/constants.ts:32](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/constants.ts#L32)

Marker value for `InjectModel` configurations that should reuse the parent state's key.
When `keyFrom` equals `INJECT_KEY`, `InjectModelImpl` reads the key from the current state via `StateManager.instance()`.
