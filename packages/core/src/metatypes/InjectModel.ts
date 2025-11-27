import {
    STRING,
    ARRAY,
    isClass,
    MetaType,
    LazyMetaTypeImpl,
    type MetaTypeArgsType,
    type SerializerArgsType,
    type DeSerializerArgsType
} from 'metatyper'

import { StateStore } from '../StateStore'
import { StateManager } from '../StateManager'
import { StateProxyManager } from '../StateProxyManager'

import { INJECT_KEY, INJECT_STORE, DEFAULT_STATE_KEY } from '../constants'
import {
    type State,
    type StateProxy,
    type StateKey,
    type InjectModelDynamicArgs,
    type InjectedState,
    type InjectModelArgs,
    type AnyRecord,
    type StateModel
} from '../types'

type InjectedModelRefType<T extends AnyRecord = AnyRecord> = {
    readonly model:
        | ((new (...args: any[]) => T) | ((state: AnyRecord) => T) | T)
        | ((new (...args: any[]) => T) | ((state: AnyRecord) => T) | T)[]
    readonly args:
        | InjectModelDynamicArgs<any, T, any>
        | ((state: AnyRecord) => InjectModelDynamicArgs<any, T, any>)
}

const InjectedStateIsReadonlyErrorMessage = `Injected state is readonly`
const NotArrayErrorMessage = (value: any) => `Expected array, got ${typeof value}`
const NotOptionalErrorMessage = `Some key is undefined when the InjectModel is not optional`
const NotNullableErrorMessage = `Some key is null when the InjectModel is not nullable`

/**
 * This is the implementation of the InjectModel metatype (metatyper).
 * This class contains the logic for creating a new state and a state proxy.
 *
 * Generally this class add GET handler to states.
 * When you access property of a state (or state proxy) with this metatype, the metatype will call serialize method of the metatype.
 *
 * @template T - The type of the state.
 */
export class InjectModelImpl extends LazyMetaTypeImpl {
    protected getKeyDefaultFieldName(propName: string) {
        return `${propName}Key`
    }

    protected getKeyValueFromState(args: {
        stateProxyOrState: State | StateProxy
        propName: string
        injectedArgs: InjectModelArgs<AnyRecord, any>
        isArray?: boolean
    }) {
        const { stateProxyOrState, propName, injectedArgs, isArray } = args

        const keyFrom = injectedArgs.keyFrom || this.getKeyDefaultFieldName(propName)
        const hasKeyField = Reflect.has(stateProxyOrState, keyFrom)

        let keyOrKeyArray =
            keyFrom === INJECT_KEY
                ? StateManager.instance(stateProxyOrState as State)?.key
                : (Reflect.get(stateProxyOrState as Record<string, any>, keyFrom) as
                      | StateKey
                      | StateKey[])

        if (keyFrom !== INJECT_KEY) {
            this.markStateKeyProperty(stateProxyOrState, propName, keyFrom)
        }

        if (isArray) {
            if (!keyOrKeyArray) {
                keyOrKeyArray = []
            } else if (!Array.isArray(keyOrKeyArray)) {
                keyOrKeyArray = [keyOrKeyArray]
            }

            return keyOrKeyArray
        }

        if (!hasKeyField && keyOrKeyArray === undefined) {
            keyOrKeyArray = DEFAULT_STATE_KEY
        }

        return keyOrKeyArray
    }

    protected setKeyValueToState(args: {
        stateProxyOrState: State | StateProxy
        propName: string
        key: StateKey | undefined | null | (StateKey | undefined | null)[]
        injectedArgs: InjectModelArgs<AnyRecord, any>
    }) {
        const { stateProxyOrState, propName, key, injectedArgs } = args

        const keyFrom = injectedArgs.keyFrom || this.getKeyDefaultFieldName(propName)
        const hasKeyField = Reflect.has(stateProxyOrState, keyFrom)

        if (!hasKeyField) {
            if (Array.isArray(key)) {
                stateProxyOrState[keyFrom] = ARRAY(
                    STRING({
                        optional: injectedArgs.optional,
                        nullable: injectedArgs.nullable
                    }),
                    { default: key }
                )
            } else {
                stateProxyOrState[keyFrom] = STRING({
                    optional: injectedArgs.optional,
                    nullable: injectedArgs.nullable,
                    default: key as any
                })
            }
        } else {
            stateProxyOrState[keyFrom] = key
        }
    }

    protected markStateKeyProperty(
        stateProxyOrState: State | StateProxy,
        propName: string,
        keyFrom: string | symbol
    ) {
        if (typeof keyFrom !== 'string') {
            return
        }

        const stateManager = StateManager.instance(stateProxyOrState)

        if (stateManager) {
            stateManager.markRelatedProps(propName, keyFrom)
        }
    }

    protected getInjectedStateMeta<T extends AnyRecord>(args: {
        stateProxyOrState: State<T> | StateProxy<T>
        getKeyValue: (args: {
            injectedArgs: InjectModelArgs<AnyRecord, any>
            isArray?: boolean
        }) => StateKey[] | StateKey | undefined | null
    }) {
        const { stateProxyOrState, getKeyValue } = args

        const injectedModelRef = this.getSubType() as InjectedModelRefType

        let injectedArgs = (injectedModelRef.args as InjectModelArgs<AnyRecord, any>) ?? {}

        if (injectedArgs instanceof Function) {
            injectedArgs = injectedArgs(stateProxyOrState) ?? {}
        }

        if (!injectedArgs.store || injectedArgs.store === INJECT_STORE) {
            injectedArgs.store = StateManager.instance(stateProxyOrState as State)?.store
        }

        let isArray = false
        let model = injectedModelRef.model

        if (Array.isArray(model)) {
            model = model[0]
            isArray = true
        }

        const keyOrKeyArray = getKeyValue({ injectedArgs, isArray })

        const getInjectedModel = (key: StateKey | null | undefined) => {
            if (!injectedArgs.optional && key === undefined) {
                throw new Error(NotOptionalErrorMessage)
            }

            if (!injectedArgs.nullable && key === null) {
                throw new Error(NotNullableErrorMessage)
            }

            if (typeof model === 'function' && !isClass(model)) {
                try {
                    model = (model as (...args: any[]) => any)(stateProxyOrState, key)
                } catch (e) {
                    if (!(e as Error).toString().includes('class as a function')) {
                        throw e
                    }
                }
            }

            if (!model || (typeof model !== 'object' && typeof model !== 'function')) {
                if (model === undefined && !injectedArgs.optional) {
                    throw new Error(NotOptionalErrorMessage)
                }

                if (model === null && !injectedArgs.nullable) {
                    throw new Error(NotNullableErrorMessage)
                }

                if (model === null) return null

                return undefined
            }

            return model as StateModel
        }

        if (isArray) {
            const keys = keyOrKeyArray as (StateKey | undefined | null)[]

            return {
                modelKeyPair: keys.map((key) => ({
                    model: getInjectedModel(key),
                    key
                })),
                injectedArgs
            }
        }

        return {
            modelKeyPair: {
                model: getInjectedModel(keyOrKeyArray as StateKey),
                key: keyOrKeyArray as StateKey
            },
            injectedArgs
        }
    }

    protected getInjectedStateProxy(args: {
        stateProxyOrState: State | StateProxy
        propName: string
    }):
        | readonly (StateProxy | State | null | undefined)[]
        | StateProxy
        | State
        | null
        | undefined {
        const { stateProxyOrState, propName } = args

        const stateManager = StateManager.instance(stateProxyOrState as State)
        const stateProxyManager = StateProxyManager.instance(stateProxyOrState as StateProxy)

        stateManager.markStateProperty(propName)

        const getSingleInjectedStateProxy = (args: {
            model?: StateModel | undefined | null
            key?: StateKey | undefined | null
            injectedArgs: InjectModelArgs<AnyRecord, any>
        }): StateProxy | State | null | undefined => {
            const { model, key, injectedArgs } = args

            if (!model) {
                return model as undefined | null
            }

            if (!key) {
                return key as undefined | null
            }

            const [injectedState] = StateManager.getOrCreateState(model, {
                key,
                store: injectedArgs.store as StateStore | undefined
            })

            if (!stateProxyManager || !StateProxyManager.isStateProxy(stateProxyOrState)) {
                return injectedState
            }

            const parentStateProxy = stateProxyManager.stateProxy
            const observeProps =
                injectedArgs?.observeProps ||
                (typeof stateProxyManager.observableProps[propName] === 'object'
                    ? (stateProxyManager.observableProps[propName] as object)
                    : undefined) ||
                {}

            const autoResolveObservableProps =
                injectedArgs?.autoResolveObservableProps ??
                stateProxyManager.autoResolveObservableProps ??
                true

            const [injectedStateProxy] = StateProxyManager.getOrCreateStateProxy(injectedState, {
                parentStateProxy,
                observeProps,
                autoResolveObservableProps
            })

            return injectedStateProxy
        }

        const injectedStateMeta = this.getInjectedStateMeta({
            stateProxyOrState,
            getKeyValue: (args) =>
                this.getKeyValueFromState({
                    stateProxyOrState,
                    propName,
                    injectedArgs: args.injectedArgs,
                    isArray: args.isArray
                })
        })

        if (Array.isArray(injectedStateMeta.modelKeyPair)) {
            const stateProxyArray = Object.freeze(
                injectedStateMeta.modelKeyPair.map(({ model, key }) =>
                    getSingleInjectedStateProxy({
                        model,
                        key,
                        injectedArgs: injectedStateMeta.injectedArgs
                    })
                )
            )

            return stateProxyArray
        }

        const stateProxy = getSingleInjectedStateProxy({
            model: injectedStateMeta.modelKeyPair.model,
            key: injectedStateMeta.modelKeyPair.key,
            injectedArgs: injectedStateMeta.injectedArgs
        })

        return stateProxy
    }

    protected setInjectedState(args: {
        stateProxyOrState: State | StateProxy
        propName: string
        value: AnyRecord | AnyRecord[]
    }) {
        const { stateProxyOrState, propName, value } = args

        const getKeyValueFromValue = (args: {
            injectedArgs: InjectModelArgs<AnyRecord, any>
            isArray?: boolean
        }) => {
            const { injectedArgs, isArray } = args

            const keyResolver = injectedArgs.keyResolver as
                | (string | ((item: AnyRecord) => StateKey))
                | undefined

            if (!keyResolver) throw new Error(InjectedStateIsReadonlyErrorMessage)

            const keyResolverFunc = (item: AnyRecord) => {
                if (!item) return item

                return typeof keyResolver === 'function'
                    ? keyResolver(item)
                    : (item[keyResolver] as StateKey)
            }

            if (isArray) {
                if (!Array.isArray(value)) {
                    throw new Error(NotArrayErrorMessage(value))
                }

                return value.map(keyResolverFunc)
            }

            return keyResolverFunc(value)
        }

        const injectedStateMeta = this.getInjectedStateMeta({
            stateProxyOrState,
            getKeyValue: getKeyValueFromValue
        })

        const addOrReplaceState = (args: {
            item: AnyRecord
            model: AnyRecord
            key: StateKey
            injectedArgs: InjectModelArgs<AnyRecord, any>
        }) => {
            const { item, model, key, injectedArgs } = args

            if (StateManager.isState(item)) {
                return
            }

            const [state, isNew] = StateManager.getOrCreateState(model, {
                key,
                store: injectedArgs.store as StateStore | undefined,
                initialValues: item
            })

            if (!isNew) {
                const mountedProxies = StateProxyManager.getMountedStateProxies(state)

                // replace state with new one
                StateManager.createState(model, {
                    key,
                    store: injectedArgs.store as StateStore | undefined,
                    initialValues: item
                })

                // rerender all mounted proxies
                mountedProxies.forEach((mountedProxy) => {
                    const stateProxyManager = StateProxyManager.instance(mountedProxy)

                    if (!stateProxyManager) return

                    stateProxyManager.triggerMountHandler()
                })
            }
        }

        if (Array.isArray(injectedStateMeta.modelKeyPair)) {
            const processedKeySet = new Set<StateKey>()
            const statesToAddOrReplace: {
                item: AnyRecord
                model: AnyRecord
                key: StateKey
                injectedArgs: InjectModelArgs<AnyRecord, any>
            }[] = []

            const reversedModelKeyPair = [...injectedStateMeta.modelKeyPair].reverse()

            reversedModelKeyPair.forEach(({ model, key }, index) => {
                const item = value[reversedModelKeyPair.length - index - 1]

                if (key === undefined || model === undefined || item === undefined) {
                    if (!injectedStateMeta.injectedArgs.optional) {
                        throw new Error(NotOptionalErrorMessage)
                    }

                    return
                }

                if (key === null || model === null || item === null) {
                    if (!injectedStateMeta.injectedArgs.nullable) {
                        throw new Error(NotNullableErrorMessage)
                    }

                    return
                }

                if (processedKeySet.has(key)) return

                processedKeySet.add(key)

                statesToAddOrReplace.push({
                    item,
                    model,
                    key,
                    injectedArgs: injectedStateMeta.injectedArgs
                })
            })

            statesToAddOrReplace.forEach(addOrReplaceState)

            this.setKeyValueToState({
                stateProxyOrState,
                propName,

                key: injectedStateMeta.modelKeyPair.map(({ key }) => key),
                injectedArgs: injectedStateMeta.injectedArgs
            })
        } else {
            const item = value
            const { key, model } = injectedStateMeta.modelKeyPair

            if (key === undefined || model === undefined || item === undefined) {
                if (!injectedStateMeta.injectedArgs.optional) {
                    throw new Error(NotOptionalErrorMessage)
                }
            } else if (key === null || model === null || item === null) {
                if (!injectedStateMeta.injectedArgs.nullable) {
                    throw new Error(NotNullableErrorMessage)
                }
            } else {
                addOrReplaceState({
                    item,
                    model,
                    key,
                    injectedArgs: injectedStateMeta.injectedArgs
                })
            }

            this.setKeyValueToState({
                stateProxyOrState,
                propName,
                key,
                injectedArgs: injectedStateMeta.injectedArgs
            })
        }
    }

    protected resolveStateProxyOrState(targetObject: AnyRecord) {
        let stateProxyOrState: State | StateProxy | undefined

        const stateProxyManager = StateProxyManager.instance(targetObject)

        if (stateProxyManager) {
            stateProxyOrState = stateProxyManager.stateProxy
        } else {
            const stateManager = StateManager.instance(targetObject)

            if (stateManager) {
                stateProxyOrState = stateManager.state
            }
        }

        return stateProxyOrState
    }

    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'InjectModel',
            serialize: (serializationArgs: SerializerArgsType) => {
                const { targetObject, propName } = serializationArgs

                if (!targetObject || !propName || typeof propName === 'symbol') return

                const stateProxyOrState = this.resolveStateProxyOrState(targetObject)

                if (!stateProxyOrState) return

                const computedValue = this.getInjectedStateProxy({
                    stateProxyOrState,
                    propName
                })

                return computedValue
            }
        })
        this.builtinDeSerializers.push({
            name: 'InjectModel',
            deserialize: (deserializationArgs: DeSerializerArgsType) => {
                const { targetObject, propName, value } = deserializationArgs

                if (!targetObject || !propName || typeof propName === 'symbol') return

                const stateProxyOrState = this.resolveStateProxyOrState(targetObject)

                if (!stateProxyOrState) return

                return this.setInjectedState({
                    stateProxyOrState,
                    propName,
                    value
                })
            }
        })
    }

    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'InjectedModel' }
    }

    override metaTypeValidatorFunc() {
        return false
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================
/**
 * Creates a read-only property that returns a state or state proxy (new or from the store).
 * When you read the property, FluxModels calls `StateManager.getOrCreateState()` with the provided model.
 * If the parent state is a proxy, the property will return a state proxy.
 *
 * @param model - A class, a plain object, or a function that returns a class/object. For arrays, pass a single-element array.
 * @param args  - Optional settings (can also be a function returning settings).
 *
 * **Behavior:**
 * - Defaults: required by default -> `optional = false`, `nullable = false`.
 * - Single injection (one state):
 *   - No key field on the owner state -> uses a default key (special string `[[DefaultStateKey]]`) and returns that state.
 *   - Key is `undefined`:
 *     - throws error "Some key is undefined when the InjectModel is not optional"
 *     - unless `optional: true` -> returns `undefined`
 *   - Key is `null`:
 *     - throws error "Some key is null when the InjectModel is not nullable"
 *     - unless `nullable: true` -> returns `null`
 * - Array injection (many states):
 *   - In standard case it returns an array of states (frozen, readonly T[]).
 *   - Missing/empty keys field -> returns an empty, frozen array (readonly []).
 *   - Not array key field -> wrapped in an array.
 *   - Each element key follows the same `undefined`/`null` rules as in keys array (in case optional and nullable are enabled).
 * - Model accessor returns `undefined`/`null`:
 *   - If dynamic model used (() => model) and model accessor returns `undefined`/`null`,
 *     depending on the flags (optional, nullable), it returns `undefined`/`null` or throws an error.
 *
 * All errors are thrown during state creation (getOrCreateState).
 * You can use `optional` and `nullable` flags to avoid errors.
 *
 * @example
 * Basic usage:
 *
 * ```ts
 * class Inner { name = 'x' }
 * class Outer {
 *   inner = InjectModel(Inner)
 *   items = InjectModel([Inner])
 * }
 * ```
 *
 * @overload
 * Dynamic model accessor with array injection.
 * Returns a readonly array of states determined by a function that computes the model based on state and key.
 *
 * @param model - Array with single model accessor function: `(state, key) => Model | undefined | null`
 * @param args - Optional settings
 * @returns Readonly array of injected states (can include undefined/null based on flags)
 *
 * @example
 * ```ts
 * class Item { id = '' }
 * class List {
 *   type = 'user'
 *   keys = ['a', 'b']
 *   items = InjectModel([(state, key) => state.type === 'user' ? UserModel : ItemModel], {
 *     keyFrom: 'keys'
 *   })
 * }
 * ```
 */
export function InjectModel<
    StateT extends AnyRecord,
    OptionalT extends boolean,
    NullableT extends boolean,
    KeyResolverT extends (string | ((item: InstanceT) => StateKey)) | undefined,
    ModelAccessorT extends (
        state: StateT,
        key: StateKey
    ) => AnyRecord | (new (...args: any[]) => AnyRecord) | undefined | null | void,
    ModelAccessorReturnT extends ReturnType<ModelAccessorT>,
    ModelT extends Exclude<ModelAccessorReturnT, undefined | null | void>,
    InstanceT extends ModelT extends infer U
        ? U extends new (...args: any[]) => any
            ? InstanceType<U>
            : U
        : never,
    ResultT extends
        | (undefined extends ModelAccessorReturnT ? undefined : never)
        | (null extends ModelAccessorReturnT ? null : never)
        | ([OptionalT] extends [true] ? undefined : never)
        | ([NullableT] extends [true] ? null : never)
        | InjectedState<InstanceT, undefined extends KeyResolverT ? true : false>
>(
    model: ModelAccessorT[],
    args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>
): readonly ResultT[]

/**
 * @overload
 * Error signature: function arrays are not allowed directly.
 * Use model accessor syntax instead: `[(state, key) => YourModel]`
 */
export function InjectModel(model: (() => any)[], args?: any): never

/**
 * @overload
 * Dynamic model accessor for single state injection.
 * Returns a single state determined by a function that computes the model based on state and key.
 *
 * @param model - Model accessor function: `(state, key) => Model | undefined | null`
 * @param args - Optional settings
 * @returns Single injected state (can be undefined/null based on flags)
 *
 * @example
 * ```ts
 * class UserModel { name = '' }
 * class AdminModel { role = 'admin' }
 * class Container {
 *   isAdmin = false
 *   userId = 'u1'
 *   user = InjectModel((state) => state.isAdmin ? AdminModel : UserModel, {
 *     keyFrom: 'userId'
 *   })
 * }
 * ```
 */
export function InjectModel<
    StateT extends AnyRecord,
    OptionalT extends boolean,
    NullableT extends boolean,
    KeyResolverT extends (string | ((item: InstanceT) => StateKey)) | undefined,
    ModelAccessorT extends (
        state: StateT,
        key: StateKey
    ) => AnyRecord | (new (...args: any[]) => AnyRecord) | undefined | null | void,
    ModelAccessorReturnT extends ReturnType<ModelAccessorT>,
    ModelT extends Exclude<ModelAccessorReturnT, undefined | null | void>,
    InstanceT extends ModelT extends infer U
        ? U extends new (...args: any[]) => any
            ? InstanceType<U>
            : U
        : never,
    ResultT extends
        | (undefined extends ModelAccessorReturnT ? undefined : never)
        | (null extends ModelAccessorReturnT ? null : never)
        | ([OptionalT] extends [true] ? undefined : never)
        | ([NullableT] extends [true] ? null : never)
        | InjectedState<InstanceT, undefined extends KeyResolverT ? true : false>
>(
    model: ModelAccessorT,
    args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>
): ResultT

/**
 * @overload
 * Error signature: functions are not allowed directly.
 * Use model accessor syntax instead: `(state, key) => YourModel`
 */
export function InjectModel(model: () => any, args?: any): never

/**
 * @overload
 * Static model with array injection.
 * Returns a readonly array of states based on a static model (class or object).
 *
 * @param model - Array with single model: `[MyClass]` or `[{ prop: value }]`
 * @param args - Optional settings
 * @returns Readonly array of injected states (can include undefined/null based on flags)
 *
 * @example
 * Default key and undefined/null keys (array):
 *
 * ```ts
 * class Item { id = '' }
 * class List {
 *   keys: (string | null | undefined)[] = [undefined, 'a', null]
 *   items = InjectModel([Item], { keyFrom: 'keys', optional: true, nullable: true })
 *
 *   items2 = InjectModel([Item])
 *
 *   items3Key = undefined
 *   items3 = InjectModel([Item])
 * }
 *
 * const [list] = StateManager.getOrCreateState(List)
 * list.items // readonly [undefined, Item('a'), null]
 * list.items2 // readonly [] // no items2Key provided
 * list.items3 // readonly [] // items3Key is undefined
 *
 * class List2 {
 *   keys = ['a', null]
 *   items = InjectModel([Item], { keyFrom: 'keys' })
 * }
 *
 * const [list2] = StateManager.getOrCreateState(List2) // throws error (because nullable is false, but there are null keys)
 * ```
 */
export function InjectModel<
    StateT extends AnyRecord,
    OptionalT extends boolean,
    NullableT extends boolean,
    KeyResolverT extends (string | ((item: InstanceT) => StateKey)) | undefined,
    ModelT extends AnyRecord | (new (...args: any[]) => AnyRecord),
    InstanceT extends ModelT extends infer U
        ? U extends new (...args: any[]) => any
            ? InstanceType<U>
            : U
        : never,
    ResultT extends
        | ([OptionalT] extends [true] ? undefined : never)
        | ([NullableT] extends [true] ? null : never)
        | InjectedState<InstanceT, undefined extends KeyResolverT ? true : false>
>(
    model: ModelT[],
    args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>
): readonly ResultT[]

/**
 * @overload
 * Static model for single state injection.
 * Returns a single state based on a static model (class or object).
 *
 * @param model - A model class or plain object
 * @param args - Optional settings
 * @returns Single injected state (can be undefined/null based on flags)
 *
 * @example
 * Default key and undefined/null keys (single):
 *
 * ```ts
 * class Inner { name = 'x' }
 * class Outer {
 *   // no innerKey here -> will use default key
 *   inner = InjectModel(Inner)
 *
 *   // also if keyFrom is provided, no inner2Key here -> will use default key
 *   inner2 = InjectModel(Inner, { keyFrom: 'inner2Key' })
 *
 *   // optional: allow undefined key -> returns undefined
 *   userKey?: string
 *   user = InjectModel(Inner, { optional: true })
 *
 *   // nullable: allow null key -> returns null
 *   postId: string | null = null
 *   post = InjectModel(Inner, { keyFrom: 'postId', nullable: true })
 * }
 *
 * const [outer] = StateManager.getOrCreateState(Outer)
 * outer.inner.name // ok, resolved by default key
 * outer.inner2.name // ok, resolved by default key
 * outer.user // undefined (no key provided, but optional enabled)
 * outer.post // null (explicit null key, nullable enabled)
 *
 * outer.userKey = 'u1' // if u1 not in store, it will be created here
 * outer.user?.name // now a real state
 * ```
 *
 * @example
 * Error on null/undefined key:
 *
 * ```ts
 * class Target { a = 1 }
 * class Host {
 *   kid: string | null = null
 *   inj = InjectModel(Target, { keyFrom: 'kid' }) // nullable=false by default
 * }
 *
 * StateManager.getOrCreateState(Host) // throws error
 *
 * class Host2 {
 *   kid = STRING({ optional: true, default: 'myid' })
 *   inj = InjectModel(Target, { keyFrom: 'kid' })
 * }
 *
 * const [host2] = StateManager.getOrCreateState(Host2)
 * host2.inj // Target('myid')
 *
 * host2.kid = undefined // don't throw error
 * console.log(host2.inj) // throws error (because optional is false, but key is undefined)
 * ```
 */
export function InjectModel<
    StateT extends AnyRecord,
    OptionalT extends boolean,
    NullableT extends boolean,
    KeyResolverT extends (string | ((item: InstanceT) => StateKey)) | undefined,
    ModelT extends AnyRecord | (new (...args: any[]) => AnyRecord),
    InstanceT extends ModelT extends infer U
        ? U extends new (...args: any[]) => any
            ? InstanceType<U>
            : U
        : never,
    ResultT extends
        | ([OptionalT] extends [true] ? undefined : never)
        | ([NullableT] extends [true] ? null : never)
        | InjectedState<InstanceT, undefined extends KeyResolverT ? true : false>
>(
    model: ModelT,
    args?: InjectModelDynamicArgs<StateT, InstanceT, KeyResolverT, OptionalT, NullableT>
): ResultT

/**
 * @overload
 * Fallback generic signature for type inference.
 */
export function InjectModel<T>(model: T, args?: InjectModelDynamicArgs<any, any, any>): unknown

export function InjectModel(model: any, args?: any): any {
    return MetaType(InjectModelImpl, {
        subType: {
            model,
            args: args ?? {}
        }
    })
}
