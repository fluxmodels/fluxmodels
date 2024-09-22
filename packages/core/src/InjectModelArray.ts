import {
    Meta,
    MetaType,
    type MetaTypeArgsType,
    type DeSerializeMetaTypeArgsType,
    type SerializeMetaTypeArgsType
} from 'metatyper'

import { StateManager, type StateType } from './StateManager'
import { StateProxyManager, type StateProxyType } from './StateProxyManager'
import {
    InjectModelImpl,
    type InjectDynamicArgsType,
    type InjectedStateProxyArgsType,
    type InjectedType
} from './InjectModel'

export type InjectedArrayType<T extends Record<keyof any, any>> = InjectedType<T> & {
    _injectedArray?: true
}

export type InjectArrayDynamicArgsType<T extends Record<keyof any, any> | undefined | null> =
    InjectDynamicArgsType & {
        item: T
        index: number
    }

export type InjectedStateProxyArrayArgsType<T extends Record<keyof any, any>> =
    InjectedStateProxyArgsType<T>

export type InjectedStateProxyArrayDynamicArgsType<T extends Record<keyof any, any>> =
    | InjectedStateProxyArrayArgsType<T>
    | ((args: InjectArrayDynamicArgsType<T>) => InjectedStateProxyArrayArgsType<T>)

/**
 * This is the implementation of the InjectModelArray metatype (metatyper).
 * This class contains the logic for creating a new array of states and state proxies.
 *
 * Generally this class adds GET handler to states.
 * When you access property of a state (or state proxy) with this metatype, the metatype will call serialize method of the metatype.
 *
 * @template T - The type of the state.
 */
export class InjectModelArrayImpl extends InjectModelImpl {
    protected deserializeFromArray(deserializationArgs: DeSerializeMetaTypeArgsType) {
        const propName = deserializationArgs.propName
        const stateOrStateProxy = deserializationArgs.targetObject as StateType | StateProxyType

        if (!stateOrStateProxy || !propName || typeof propName === 'symbol') return

        const array = deserializationArgs.value as any[]

        return array?.map((item, index) => {
            const tupleModelArgs = this.getPreparedInjectedModelAndArgs(stateOrStateProxy, {
                propName,
                item,
                index
            })

            if (!tupleModelArgs) return tupleModelArgs

            const [model, injectedArgs] = tupleModelArgs

            const [injectedState] = this.getInjectedState(model, {
                key: injectedArgs.key || JSON.stringify(Meta.serialize(item)),
                keyEqual: injectedArgs.keyEqual,
                store: injectedArgs.store
            })

            const stateManager = StateManager.instance(injectedState)

            if (!stateManager.context.isDeserialized && injectedState !== item) {
                stateManager.context.isDeserialized = true // prevent circular deserialization

                Meta.deserialize(injectedState, item)

                delete stateManager.context.isDeserialized
            }

            return injectedState
        })
    }

    protected serializeToStatesArray(serializationArgs: SerializeMetaTypeArgsType) {
        const propName = serializationArgs.propName
        const stateOrStateProxy = serializationArgs.targetObject as StateType | StateProxyType

        if (!stateOrStateProxy || !propName || typeof propName === 'symbol') return

        let array = serializationArgs.value as any[]

        if (Array.isArray(array)) {
            array = array.map((item, index) => {
                if (!StateProxyManager.isStateProxy(stateOrStateProxy)) {
                    return item
                }

                const tupleModelArgs = this.getPreparedInjectedModelAndArgs(stateOrStateProxy, {
                    propName,
                    item,
                    index
                })

                if (!tupleModelArgs) return tupleModelArgs

                const [, injectedArgs] = tupleModelArgs

                return this.getInjectedStateProxy({
                    stateProxy: stateOrStateProxy as StateProxyType,
                    injectedState: item,
                    isNewInjectedState: false,
                    propName,
                    injectedArgs
                })
            })
        } else {
            array = []
        }

        return Object.freeze(array)
    }

    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'InjectModelArray',
            serialize: (...args) => {
                try {
                    return this.serializeToStatesArray(...args)
                } catch (e) {
                    console.error(e)

                    throw e
                }
            }
        })

        this.builtinDeSerializers.push({
            name: 'InjectModelArray',
            deserialize: (...args) => {
                try {
                    return this.deserializeFromArray(...args)
                } catch (e) {
                    console.error(e)

                    throw e
                }
            }
        })
    }

    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'InjectedModelArray' }
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================

/**
 * Creates a dynamic property that returns an array of states (either new or from the store).
 * When the property is accessed, it calls StateManager.getOrCreateState() for each item in the array with the provided model and arguments.
 *
 * @param model - A function that returns the model for each item. It receives the item, index, state, and property name as arguments.
 * @param args - Optional arguments for state creation or retrieval. Can be a function that returns the args for each item.
 * @template T - The type of the state.
 *
 * @example
 * Basic usage:
 *
 * ```ts
 * class Product {
 *   id = ''
 *   name = ''
 * }
 *
 * class Model {
 *   products = InjectModelArray(
 *     Product,
 *     ({item}) => ({ key: item.id })
 *   )
 * }
 * ```
 *
 * @example
 * Usage with dynamic model selection:
 *
 * ```ts
 * class RegularProduct {
 *   id = ''
 *   name = ''
 * }
 *
 * class SpecialProduct {
 *   id = ''
 *   name = ''
 *   isSpecial = true
 * }
 *
 * class Model {
 *   products = InjectModelArray<SpecialProduct | RegularProduct>(
 *     ({item}) => item.isSpecial ? SpecialProduct : RegularProduct,
 *     ({item}) => ({ key: item.id })
 *   )
 * }
 * ```
 */
export function InjectModelArray<
    C extends
        | Record<keyof any, any>
        | Record<keyof any, any>[]
        | (new (...args: any[]) => any)
        | (new (...args: any[]) => any)[]
        | undefined
        | null,
    T extends C extends new (...args: any[]) => any ? InstanceType<C> : C
>(
    model: <ReturnT extends Record<keyof any, any> | undefined | null = Partial<T>>(
        args: InjectArrayDynamicArgsType<ReturnT>
    ) => C,
    args?: InjectedStateProxyArrayDynamicArgsType<T>
): InjectedArrayType<readonly T[]>

export function InjectModelArray<ReturnT extends Record<keyof any, any> | undefined | null>(
    model: (
        args: InjectArrayDynamicArgsType<Partial<ReturnT>>
    ) =>
        | Record<keyof any, any>
        | Record<keyof any, any>[]
        | (new (...args: any[]) => any)
        | (new (...args: any[]) => any)[]
        | undefined
        | null,
    args?: InjectedStateProxyArrayDynamicArgsType<Partial<ReturnT>>
): InjectedArrayType<readonly ReturnT[]>

export function InjectModelArray<T extends object>(
    model: new (...args: any[]) => T,
    args?: InjectedStateProxyArrayDynamicArgsType<T>
): InjectedArrayType<readonly T[]>

export function InjectModelArray<T>(
    model: T,
    args?: T extends object ? InjectedStateProxyArrayDynamicArgsType<T> : any
): T extends object ? InjectedArrayType<readonly T[]> : unknown

export function InjectModelArray(model: any, args?: any): any[] {
    return MetaType(InjectModelArrayImpl, {
        subType: {
            model,
            args: args ?? {}
        }
    })
}
