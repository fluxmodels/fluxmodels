[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type AnyRecord = Record<keyof any, any>;
```

Defined in: [core/src/types.ts:31](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L31)

Represents the loosest object shape supported by the FluxModels state runtime.

This alias keeps the API expressive while mapping to `Record<string | number | symbol, any>`.
