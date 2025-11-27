[**@fluxmodels/fluxmodels**](../../../README.md)

***

## Call Signature

```ts
function InjectModel<StateT, OptionalT, NullableT, KeyResolverT, ModelAccessorT, ModelAccessorReturnT, ModelT, InstanceT, ResultT>(model: ModelAccessorT[], args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>): readonly ResultT[];
```

Defined in: [core/src/metatypes/InjectModel.ts:621](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L621)

Creates a read-only property that returns a state or state proxy (new or from the store).
When you read the property, FluxModels calls `StateManager.getOrCreateState()` with the provided model.
If the parent state is a proxy, the property will return a state proxy.

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

`StateT` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`OptionalT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`NullableT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (`item`: `InstanceT`) => `string` \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelAccessorT` *extends* (`state`: `StateT`, `key`: `string`) => 
  \| `void`
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| `null`
  \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelAccessorReturnT` *extends* 
  \| `void`
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| `null`
  \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelT` *extends* 
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`InstanceT` *extends* `any`

</td>
</tr>
<tr>
<td>

`ResultT` *extends* `any`

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

`model`

</td>
<td>

`ModelAccessorT`[]

</td>
<td>

A class, a plain object, or a function that returns a class/object. For arrays, pass a single-element array.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`InjectModelDynamicArgs`](../type-aliases/InjectModelDynamicArgs.md)\<`StateT`, `InstanceT`, `KeyResolverT`, `OptionalT`, `NullableT`\>

</td>
<td>

Optional settings (can also be a function returning settings).

**Behavior:**
- Defaults: required by default -> `optional = false`, `nullable = false`.
- Single injection (one state):
  - No key field on the owner state -> uses a default key (special string `[[DefaultStateKey]]`) and returns that state.
  - Key is `undefined`:
    - throws error "Some key is undefined when the InjectModel is not optional"
    - unless `optional: true` -> returns `undefined`
  - Key is `null`:
    - throws error "Some key is null when the InjectModel is not nullable"
    - unless `nullable: true` -> returns `null`
- Array injection (many states):
  - In standard case it returns an array of states (frozen, readonly T[]).
  - Missing/empty keys field -> returns an empty, frozen array (readonly []).
  - Not array key field -> wrapped in an array.
  - Each element key follows the same `undefined`/`null` rules as in keys array (in case optional and nullable are enabled).
- Model accessor returns `undefined`/`null`:
  - If dynamic model used (() => model) and model accessor returns `undefined`/`null`,
    depending on the flags (optional, nullable), it returns `undefined`/`null` or throws an error.

All errors are thrown during state creation (getOrCreateState).
You can use `optional` and `nullable` flags to avoid errors.

</td>
</tr>
</tbody>
</table>

### Returns

readonly `ResultT`[]

Readonly array of injected states (can include undefined/null based on flags)

### Examples

Basic usage:

```ts
class Inner { name = 'x' }
class Outer {
  inner = InjectModel(Inner)
  items = InjectModel([Inner])
}
```

Dynamic model accessor with array injection.
Returns a readonly array of states determined by a function that computes the model based on state and key.

```ts
class Item { id = '' }
class List {
  type = 'user'
  keys = ['a', 'b']
  items = InjectModel([(state, key) => state.type === 'user' ? UserModel : ItemModel], {
    keyFrom: 'keys'
  })
}
```

## Call Signature

```ts
function InjectModel(model: () => any[], args?: any): never;
```

Defined in: [core/src/metatypes/InjectModel.ts:653](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L653)

Error signature: function arrays are not allowed directly.
Use model accessor syntax instead: `[(state, key) => YourModel]`

### Parameters

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

`model`

</td>
<td>

() => `any`[]

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

`any`

</td>
</tr>
</tbody>
</table>

### Returns

`never`

## Call Signature

```ts
function InjectModel<StateT, OptionalT, NullableT, KeyResolverT, ModelAccessorT, ModelAccessorReturnT, ModelT, InstanceT, ResultT>(model: ModelAccessorT, args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>): ResultT;
```

Defined in: [core/src/metatypes/InjectModel.ts:677](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L677)

Dynamic model accessor for single state injection.
Returns a single state determined by a function that computes the model based on state and key.

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

`StateT` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`OptionalT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`NullableT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (`item`: `InstanceT`) => `string` \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelAccessorT` *extends* (`state`: `StateT`, `key`: `string`) => 
  \| `void`
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| `null`
  \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelAccessorReturnT` *extends* 
  \| `void`
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| `null`
  \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelT` *extends* 
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`InstanceT` *extends* `any`

</td>
</tr>
<tr>
<td>

`ResultT` *extends* `any`

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

`model`

</td>
<td>

`ModelAccessorT`

</td>
<td>

Model accessor function: `(state, key) => Model | undefined | null`

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`InjectModelDynamicArgs`](../type-aliases/InjectModelDynamicArgs.md)\<`StateT`, `InstanceT`, `KeyResolverT`, `OptionalT`, `NullableT`\>

</td>
<td>

Optional settings

</td>
</tr>
</tbody>
</table>

### Returns

`ResultT`

Single injected state (can be undefined/null based on flags)

### Example

```ts
class UserModel { name = '' }
class AdminModel { role = 'admin' }
class Container {
  isAdmin = false
  userId = 'u1'
  user = InjectModel((state) => state.isAdmin ? AdminModel : UserModel, {
    keyFrom: 'userId'
  })
}
```

## Call Signature

```ts
function InjectModel(model: () => any, args?: any): never;
```

Defined in: [core/src/metatypes/InjectModel.ts:709](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L709)

Error signature: functions are not allowed directly.
Use model accessor syntax instead: `(state, key) => YourModel`

### Parameters

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

`model`

</td>
<td>

() => `any`

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

`any`

</td>
</tr>
</tbody>
</table>

### Returns

`never`

## Call Signature

```ts
function InjectModel<StateT, OptionalT, NullableT, KeyResolverT, ModelT, InstanceT, ResultT>(model: ModelT[], args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>): readonly ResultT[];
```

Defined in: [core/src/metatypes/InjectModel.ts:748](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L748)

Static model with array injection.
Returns a readonly array of states based on a static model (class or object).

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

`StateT` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`OptionalT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`NullableT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (`item`: `InstanceT`) => `string` \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelT` *extends* 
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`InstanceT` *extends* `any`

</td>
</tr>
<tr>
<td>

`ResultT` *extends* `any`

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

`model`

</td>
<td>

`ModelT`[]

</td>
<td>

Array with single model: `[MyClass]` or `[{ prop: value }]`

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`InjectModelDynamicArgs`](../type-aliases/InjectModelDynamicArgs.md)\<`StateT`, `InstanceT`, `KeyResolverT`, `OptionalT`, `NullableT`\>

</td>
<td>

Optional settings

</td>
</tr>
</tbody>
</table>

### Returns

readonly `ResultT`[]

Readonly array of injected states (can include undefined/null based on flags)

### Example

Default key and undefined/null keys (array):

```ts
class Item { id = '' }
class List {
  keys: (string | null | undefined)[] = [undefined, 'a', null]
  items = InjectModel([Item], { keyFrom: 'keys', optional: true, nullable: true })

  items2 = InjectModel([Item])

  items3Key = undefined
  items3 = InjectModel([Item])
}

const [list] = StateManager.getOrCreateState(List)
list.items // readonly [undefined, Item('a'), null]
list.items2 // readonly [] // no items2Key provided
list.items3 // readonly [] // items3Key is undefined

class List2 {
  keys = ['a', null]
  items = InjectModel([Item], { keyFrom: 'keys' })
}

const [list2] = StateManager.getOrCreateState(List2) // throws error (because nullable is false, but there are null keys)
```

## Call Signature

```ts
function InjectModel<StateT, OptionalT, NullableT, KeyResolverT, ModelT, InstanceT, ResultT>(model: ModelT, args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>): ResultT;
```

Defined in: [core/src/metatypes/InjectModel.ts:832](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L832)

Static model for single state injection.
Returns a single state based on a static model (class or object).

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

`StateT` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`OptionalT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`NullableT` *extends* `boolean`

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (`item`: `InstanceT`) => `string` \| `undefined`

</td>
</tr>
<tr>
<td>

`ModelT` *extends* 
  \| [`AnyRecord`](../type-aliases/AnyRecord.md)
  \| (...`args`: `any`[]) => [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`InstanceT` *extends* `any`

</td>
</tr>
<tr>
<td>

`ResultT` *extends* `any`

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

`model`

</td>
<td>

`ModelT`

</td>
<td>

A model class or plain object

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`InjectModelDynamicArgs`](../type-aliases/InjectModelDynamicArgs.md)\<`StateT`, `InstanceT`, `KeyResolverT`, `OptionalT`, `NullableT`\>

</td>
<td>

Optional settings

</td>
</tr>
</tbody>
</table>

### Returns

`ResultT`

Single injected state (can be undefined/null based on flags)

### Examples

Default key and undefined/null keys (single):

```ts
class Inner { name = 'x' }
class Outer {
  // no innerKey here -> will use default key
  inner = InjectModel(Inner)

  // also if keyFrom is provided, no inner2Key here -> will use default key
  inner2 = InjectModel(Inner, { keyFrom: 'inner2Key' })

  // optional: allow undefined key -> returns undefined
  userKey?: string
  user = InjectModel(Inner, { optional: true })

  // nullable: allow null key -> returns null
  postId: string | null = null
  post = InjectModel(Inner, { keyFrom: 'postId', nullable: true })
}

const [outer] = StateManager.getOrCreateState(Outer)
outer.inner.name // ok, resolved by default key
outer.inner2.name // ok, resolved by default key
outer.user // undefined (no key provided, but optional enabled)
outer.post // null (explicit null key, nullable enabled)

outer.userKey = 'u1' // if u1 not in store, it will be created here
outer.user?.name // now a real state
```

Error on null/undefined key:

```ts
class Target { a = 1 }
class Host {
  kid: string | null = null
  inj = InjectModel(Target, { keyFrom: 'kid' }) // nullable=false by default
}

StateManager.getOrCreateState(Host) // throws error

class Host2 {
  kid = STRING({ optional: true, default: 'myid' })
  inj = InjectModel(Target, { keyFrom: 'kid' })
}

const [host2] = StateManager.getOrCreateState(Host2)
host2.inj // Target('myid')

host2.kid = undefined // don't throw error
console.log(host2.inj) // throws error (because optional is false, but key is undefined)
```

## Call Signature

```ts
function InjectModel<T>(model: T, args?: InjectModelDynamicArgs<any, any, any>): unknown;
```

Defined in: [core/src/metatypes/InjectModel.ts:856](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/metatypes/InjectModel.ts#L856)

Fallback generic signature for type inference.

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

`T`

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
</tr>
</thead>
<tbody>
<tr>
<td>

`model`

</td>
<td>

`T`

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`InjectModelDynamicArgs`](../type-aliases/InjectModelDynamicArgs.md)\<`any`, `any`, `any`\>

</td>
</tr>
</tbody>
</table>

### Returns

`unknown`
