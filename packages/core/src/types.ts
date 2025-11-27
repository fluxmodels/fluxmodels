import { type MetaArgsType } from 'metatyper'

import { type StateManager } from './StateManager'
import { type StateStore } from './StateStore'
import { type StateProxyManager } from './StateProxyManager'

import {
    INJECT_STORE,
    IsStateProxySymbol,
    IsStateSymbol,
    StateManagerSymbol,
    StateProxyManagerSymbol,
    StateProxySnapshotSymbol,
    StateReferenceSymbol
} from './constants'

// ===================================================== utils =====================================================

export type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

export type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

/**
 * Represents the loosest object shape supported by the FluxModels state runtime.
 *
 * This alias keeps the API expressive while mapping to `Record<string | number | symbol, any>`.
 */
export type AnyRecord = Record<keyof any, any>

// ===================================================== state =====================================================

/**
 * Model definition that {@link StateManager} can use to construct a state.
 *
 * A model can either be a plain object (used as-is) or a constructor that produces the state
 * instance when invoked.
 *
 * @typeParam T - Shape of the state returned from the model.
 */
export type StateModel<T extends AnyRecord = AnyRecord> = T | (new (...args: any[]) => T)

/**
 * Identifier used to register a state within a {@link StateStore}.
 *
 * Keys allow multiple instances of the same model to coexist in the store.
 */
export type StateKey = string

type StateObj<T extends AnyRecord> = {
    [IsStateSymbol]?: true
    [StateManagerSymbol]?: StateManager<T>
}

type StateProxyObj<T extends AnyRecord> = StateObj<T> & {
    [IsStateProxySymbol]?: true
    [StateReferenceSymbol]?: State<T>
    [StateProxyManagerSymbol]?: StateProxyManager<T>
}

type StateSnapshotObj<T extends AnyRecord> = StateProxyObj<T> & {
    [StateProxySnapshotSymbol]: true
}

/**
 * Type-level predicate that evaluates to `true` when the value is a FluxModels state.
 *
 * The helper unwraps nullable and array types before checking for the hidden
 * IsStateSymbol marker attached by {@link StateManager}.
 *
 * @typeParam T - Value (or collection of values) that may be a state.
 */
export type IsStateType<
    T,
    RT = T extends readonly any[]
        ? Exclude<T[number], undefined | null | void>
        : Exclude<T, undefined | null | void>
> = RT extends { [IsStateSymbol]: true } ? true : false

/**
 * Type-level predicate that evaluates to `true` when the value is a FluxModels state proxy.
 *
 * Proxies are created by {@link StateProxyManager} and expose the IsStateProxySymbol
 * marker consumed by this helper.
 *
 * @typeParam T - Value (or collection of values) that may be a proxy.
 */
export type IsStateProxyType<
    T extends AnyRecord,
    RT = T extends readonly any[]
        ? Exclude<T[number], undefined | null | void>
        : Exclude<T, undefined | null | void>
> = RT extends { [IsStateProxySymbol]: true } ? true : false

/**
 * Predicate that resolves to `true` when the value is either a state or a state proxy.
 *
 * This is convenient for APIs that accept both raw states and proxies interchangeably.
 *
 * @typeParam T - Value (or collection of values) checked by the predicate.
 */
export type IsStateOrStateProxyType<T extends AnyRecord> =
    IsStateType<T> extends true ? true : IsStateProxyType<T> extends true ? true : false

type IsOrdinaryStateValueType<T extends AnyRecord> =
    IsInjectedStateType<T> extends true
        ? false
        : IsStateOrStateProxyType<T> extends true
          ? false
          : true

type OrdinaryStateKeysType<T extends AnyRecord, K extends keyof T> =
    IsOrdinaryStateValueType<T[K]> extends true
        ? K extends keyof StateObj<T>
            ? never
            : K extends keyof StateProxyObj<T>
              ? never
              : K
        : never

type NotOrdinaryStateKeysType<T extends AnyRecord, K extends keyof T> =
    IsOrdinaryStateValueType<T[K]> extends true ? never : K

type NotOrdinaryReadonlyStateKeysType<T extends AnyRecord, K extends keyof T> =
    IsOrdinaryStateValueType<T[K]> extends true
        ? never
        : IsInjectedStateType<T[K], false> extends true
          ? never
          : K

type NotOrdinaryWritableStateKeysType<T extends AnyRecord, K extends keyof T> =
    IsOrdinaryStateValueType<T[K]> extends true
        ? never
        : IsInjectedStateType<T[K], true> extends true
          ? never
          : K

type WrapStateType<
    T extends AnyRecord | null | undefined | void | (AnyRecord | null | undefined | void)[]
> = T extends readonly any[]
    ? readonly (
          | (undefined extends T[number] ? undefined : never)
          | (null extends T[number] ? null : never)
          | State<Exclude<T[number], undefined | null | void>>
      )[]
    :
          | (undefined extends T ? undefined : never)
          | (null extends T ? null : never)
          | State<Exclude<T, undefined | null | void>>

/**
 * Concrete shape of a FluxModels state managed by {@link StateManager}.
 *
 * The type preserves the model's ordinary properties and remaps injected properties so that
 * consumers receive wrapped states or proxies when appropriate. Internal metadata symbols
 * remain hidden from typical iteration.
 *
 * @typeParam T - The model shape used to create the state.
 */
export type State<T extends AnyRecord = AnyRecord> = StateObj<T> & {
    [K in keyof T as OrdinaryStateKeysType<T, K>]: T[K]
} & {
    readonly [K in keyof T as NotOrdinaryReadonlyStateKeysType<T, K>]: IsInjectedStateType<
        T[K]
    > extends true
        ? WrapStateType<T[K]>
        : T[K]
} & {
    [K in keyof T as NotOrdinaryWritableStateKeysType<T, K>]: IsInjectedStateType<
        T[K]
    > extends true
        ? WrapStateType<T[K]>
        : T[K]
}

type WrapStateProxyType<
    T extends AnyRecord | null | undefined | void | (AnyRecord | null | undefined | void)[]
> = T extends readonly any[]
    ? readonly (
          | (undefined extends T[number] ? undefined : never)
          | (null extends T[number] ? null : never)
          | StateProxy<Exclude<T[number], undefined | null | void>>
      )[]
    :
          | (undefined extends T ? undefined : never)
          | (null extends T ? null : never)
          | StateProxy<Exclude<T, undefined | null | void>>

/**
 * Reactive facade over a state returned by {@link StateProxyManager}.
 *
 * State proxies mirror the surface of the backing state while exposing read-only injected
 * relationships as nested proxies. They are commonly consumed by view-layer integrations.
 *
 * @typeParam T - The model shape represented by the proxy.
 */
export type StateProxy<T extends AnyRecord = AnyRecord> = StateProxyObj<T> & {
    [K in keyof T as OrdinaryStateKeysType<T, K>]: T[K]
} & {
    readonly [K in keyof T as NotOrdinaryReadonlyStateKeysType<T, K>]: IsInjectedStateType<
        T[K]
    > extends true
        ? WrapStateProxyType<T[K]>
        : T[K]
} & {
    [K in keyof T as NotOrdinaryWritableStateKeysType<T, K>]: IsInjectedStateType<
        T[K]
    > extends true
        ? WrapStateProxyType<T[K]>
        : T[K]
}

type WrapStateSnapshotType<
    T extends AnyRecord | null | undefined | void | (AnyRecord | null | undefined | void)[]
> = T extends readonly any[]
    ? readonly (
          | (undefined extends T[number] ? undefined : never)
          | (null extends T[number] ? null : never)
          | StateSnapshot<Exclude<T[number], undefined | null | void>>
      )[]
    :
          | (undefined extends T ? undefined : never)
          | (null extends T ? null : never)
          | StateSnapshot<Exclude<T, undefined | null | void>>

/**
 * Immutable view of a state captured via {@link StateProxyManager}.
 *
 * Snapshots freeze the current state values while preserving type information for injected
 * structures so they can be safely read outside of reactive contexts.
 *
 * Snapshots are side-effect free.
 *
 * @typeParam T - The model shape represented by the snapshot.
 */
export type StateSnapshot<T extends AnyRecord> = StateSnapshotObj<T> & {
    readonly [K in keyof T as K extends OrdinaryStateKeysType<T, K> ? K : never]: T[K]
} & {
    readonly [K in keyof T as K extends NotOrdinaryStateKeysType<T, K>
        ? K
        : never]: IsInjectedStateType<T[K]> extends true ? WrapStateSnapshotType<T[K]> : T[K]
}

// ===================================================== state args =====================================================

/**
 * Configuration accepted when creating or retrieving a state via {@link StateManager}.
 *
 * Use these options to override the storage location, assign initial values, or provide
 * metadata arguments for metatyper validation.
 *
 * @typeParam T - The model shape used to create the state.
 */
export type StateArgs<T extends AnyRecord> = {
    /** Explicit key to assign instead of using the model's default key. */
    key?: StateKey
    /** Store instance that should hold the state (defaults to `StateStore.defaultStore`). */
    store?: StateStore
    /**
     * Plain object whose enumerable properties will be merged onto the created state.
     *
     * Only writable, non-function, non-symbol properties are allowed.
     */
    initialValues?: Partial<{
        [K in WritableKeys<T> as IsInjectedStateType<T[K]> extends true
            ? never
            : T[K] extends (...args: any[]) => any
              ? never
              : K extends symbol
                ? never
                : K]: T[K]
    }>
    /**
     * When set to `true`, skips metatyper validation for this state creation.
     *
     * Useful when the model intentionally diverges from the declared metadata.
     */
    disableValidation?: boolean
    /** Arguments forwarded to metatyper metadata handlers. */
    metaArgs?: MetaArgsType
}

/**
 * Options that influence how {@link StateProxyManager} mounts and manages a state proxy.
 *
 * Controls observable property detection and lifecycle hooks for injected proxies.
 *
 * @typeParam T - The model shape represented by the proxy.
 */
export type StateProxyArgs<T extends AnyRecord> = {
    /**
     * Determines whether observable props should be inferred automatically from the state
     * shape when none are provided explicitly.
     */
    autoResolveObservableProps?: boolean
    /**
     * Explicit configuration describing which properties of the proxied state should be observed.
     */
    observeProps?: ObservablePropsArgs<T>
}

/**
 * Configuration accepted by the {@link StateProxyManager} constructor.
 *
 * Extends {@link StateProxyArgs} with additional options for managing injected state proxies
 * and their lifecycle initialization.
 *
 * @typeParam T - The model shape represented by the proxy.
 */
export type StateProxyManagerArgs<T extends AnyRecord = AnyRecord> = StateProxyArgs<T> & {
    /**
     * The parent state proxy, if the proxy is an injected state proxy.
     */
    parentStateProxy?: StateProxy
    /**
     * Map local to the proxy instance, storing already created children state proxies (injected states).
     */
    childrenStateProxyMap?: Map<State, StateProxy>
    /**
     * Shared cache map that stores all injected state proxies starting from the root state proxy.
     *
     * This map is used to cache injected state proxies across the entire proxy tree, preventing
     * infinite loops in circular dependencies. When injected states reference each other in a cycle,
     * this map ensures the same proxy instance is reused instead of creating new ones indefinitely.
     *
     * The cache begins at the root state proxy and includes all `Injected` properties throughout
     * the dependency graph.
     */
    globalStateProxyCacheMap?: Map<State, StateProxy>
}

/**
 * Normalized map indicating which properties of a state proxy should be observed.
 *
 * Values can be booleans or nested structures to express deep observability preferences.
 * When properties are included in this map, changes to them trigger reactivity, causing
 * mount handlers (rerender functions) to be invoked.
 *
 * Observable properties can be specified explicitly during proxy mounting via {@link StateProxyArgs}.
 * Additionally, when `autoResolveObservableProps` is set to `true`, reading properties from the
 * state proxy will automatically add them to the observable properties map, enabling automatic
 * reactivity tracking based on actual property access patterns.
 */
export type ObservableProps = {
    [K: string]: ObservableProps | boolean
}

/**
 * Input accepted when configuring observable properties on a proxy.
 *
 * The configuration can be a simple iterable of keys or a structured object that mirrors
 * nested state shape. Internal helpers convert this into {@link ObservableProps}.
 *
 * @typeParam T - The model shape represented by the proxy.
 */
export type ObservablePropsArgs<T extends AnyRecord> =
    | Iterable<keyof T>
    | {
          [K in keyof T]?: IsInjectedStateType<T[K]> extends true
              ? T[K] extends readonly (infer Item)[]
                  ? ObservablePropsArgs<Item extends AnyRecord ? Item : AnyRecord>
                  : ObservablePropsArgs<T[K]>
              : boolean
      }

export type MountHandlerType = (args: { state: State; stateProxy: StateProxy }) => any

// ===================================================== injected =====================================================

/**
 * Predicate that evaluates to `true` for values marked via {@link InjectedState}.
 *
 * Injection-aware helpers rely on this marker to determine whether a property should be
 * lazily resolved into another state or proxy instead of being copied.
 *
 * @typeParam T - Value (or collection of values) that may be an injected record.
 */
export type IsInjectedStateType<
    T,
    Readonly extends boolean = boolean,
    RT = T extends readonly any[]
        ? Exclude<T[number], undefined | null | void>
        : Exclude<T, undefined | null | void>
> = Required<RT> extends { _injected: true; _readonly: Readonly } ? true : false

/**
 * Convenience helper to tag an object as an injected dependency.
 *
 * The optional `_injected` flag is consumed by {@link IsInjectedStateType} and the state/proxy
 * managers to decide how to wrap the property during state construction.
 *
 * @typeParam T - Shape of the injected dependency.
 */
export type InjectedState<T extends AnyRecord, Readonly extends boolean = false> = T & {
    _injected?: true
    _readonly?: Readonly
}

/**
 * Extends {@link StateProxyArgs} with knobs specific to injected dependencies.
 *
 * Options such as `keyFrom`, `optional`, and `nullable` are interpreted by the metadata layer
 * (see `metatypes/InjectModel`) when preparing nested state proxies.
 *
 * @typeParam T - The injected state shape.
 * @typeParam O - Whether the dependency may be omitted.
 * @typeParam N - Whether the dependency may be `null`.
 */
export type InjectModelArgs<
    T extends AnyRecord,
    KeyResolverT extends (string | ((...args: any) => any)) | undefined,
    OptionalT extends boolean = boolean,
    NullableT extends boolean = boolean
> = StateProxyArgs<T> & {
    /**
     * Property name or symbol from the parent state whose value should be used as the injected
     * state's key.
     */
    keyFrom?: string | symbol
    /**
     * Function that resolves the key from the assigned object.
     * If provided string, it will be used as the property name on the assigned object.
     * If provided function, it will be called with the assigned object and should return the key.
     * If key is undefined, the injected state will be undefined.
     * If key is null, the injected state will be null.
     * If the state is not optional and the key is undefined, an error will be thrown.
     * If the state is not nullable and the key is null, an error will be thrown.
     * If not provided, the injected state will be readonly.
     */
    keyResolver?: KeyResolverT
    /**
     * Store instance (or injection token) where the dependent state should be resolved.
     * By default, the injected state uses the same store as its parent state (INJECT_STORE).
     */
    store?: StateStore | typeof INJECT_STORE
    /**
     * Flags the dependency as optional so missing values will not throw during resolution.
     */
    optional?: OptionalT
    /**
     * Allows the dependency to resolve to `null` in addition to regular state instances.
     */
    nullable?: NullableT
}

/**
 * Injection configuration that can be provided statically or derived from the parent state.
 *
 * The functional form is handy when the injected proxy key or store depends on runtime state.
 *
 * @typeParam ST - Parent state shape the dynamic config reads from.
 * @typeParam T - Injected state shape.
 * @typeParam O - Whether the dependency may be omitted.
 * @typeParam N - Whether the dependency may be `null`.
 */
export type InjectModelDynamicArgs<
    ST extends AnyRecord,
    T extends AnyRecord | undefined | null | void,
    KeyResolverT extends (string | ((...args: any) => StateKey)) | undefined,
    O extends boolean = boolean,
    N extends boolean = boolean
> =
    /** Static configuration applied regardless of parent state. */
    | InjectModelArgs<T extends AnyRecord ? T : AnyRecord, KeyResolverT, O, N>
    /** Function that derives configuration from the parent state at runtime. */
    | ((state: ST) => InjectModelArgs<T extends AnyRecord ? T : AnyRecord, KeyResolverT, O, N>)

// ===================================================== events =====================================================

/**
 * Generic signature implemented by all FluxModels event handlers.
 */
export type EventHandler = (...args: any[]) => any

/**
 * Decorator-compatible event definition produced by factories in `events/`.
 *
 * Calling the event with a handler registers it immediately, while calling with no arguments
 * returns a decorator that binds the handler to class methods.
 *
 * @typeParam T - The handler signature the event accepts.
 */
export type Event<T extends EventHandler> = {
    readonly _isEvent: true;

    <HandlerT extends T>(handler: HandlerT): HandlerT
    (): EventDecorator<(...args: any[]) => any>
}

/**
 * Decorator signature returned by {@link Event} when used without arguments.
 *
 * Compatible with standard TypeScript decorators and used internally by {@link EventsManager}.
 *
 * @typeParam T - Method signature being decorated.
 */
export type EventDecorator<T> = (
    targetObject: object,
    propName: string,
    descriptor: TypedPropertyDescriptor<T>
) => void
