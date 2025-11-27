[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type EventDecorator<T> = (targetObject: object, propName: string, descriptor: TypedPropertyDescriptor<T>) => void;
```

Defined in: [core/src/types.ts:499](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L499)

Decorator signature returned by [Event](Event.md) when used without arguments.

Compatible with standard TypeScript decorators and used internally by [EventsManager](../classes/EventsManager.md).

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

`T`

</td>
<td>

Method signature being decorated.

</td>
</tr>
</tbody>
</table>

## Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`targetObject`

</td>
<td>

`object`

</td>
</tr>
<tr>
<td>

`propName`

</td>
<td>

`string`

</td>
</tr>
<tr>
<td>

`descriptor`

</td>
<td>

`TypedPropertyDescriptor`\<`T`\>

</td>
</tr>
</tbody>
</table>

## Returns

`void`
