[**@fluxmodels/fluxmodels**](../../../README.md)

***

## Call Signature

```ts
function UseSuspense<T>(fn: T, args?: UseSuspenseArgs): T;
```

Defined in: [react/src/StateSuspense.tsx:76](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/StateSuspense.tsx#L76)

Wraps a function to integrate with React Suspense, or decorates a class method.

When the wrapped function returns a promise, a suspense boundary is engaged until
it settles, and then a re-render is triggered.

### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* (...`args`: `any`[]) => `any`

</td>
</tr>
</tbody>
</table>

### Parameters

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

`fn`

</td>
<td>

`T`

</td>
<td>

Function to wrap (wrapper form).

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

`UseSuspenseArgs`

</td>
<td>

Optional configuration (e.g., local rerendering).

</td>
</tr>
</tbody>
</table>

### Returns

`T`

The wrapped function that drives Suspense when returning a promise.

## Call Signature

```ts
function UseSuspense(args?: UseSuspenseArgs): MethodDecorator;
```

Defined in: [react/src/StateSuspense.tsx:84](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/StateSuspense.tsx#L84)

Method decorator form of UseSuspense.

### Parameters

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

`args?`

</td>
<td>

`UseSuspenseArgs`

</td>
<td>

Optional configuration (e.g., local rerendering).

</td>
</tr>
</tbody>
</table>

### Returns

`MethodDecorator`

A method decorator that wraps the target method for Suspense.
