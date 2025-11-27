import {
    MetaType,
    MetaTypeImpl,
    type MetaTypeArgsType,
    type SerializeMetaTypeArgsType
} from 'metatyper'

import { type StateModel } from '../types'

import { getModel } from '../utils'

/**
 * This is the implementation of the MODEL metatype (metatyper).
 * This class contains the logic for getting the model object.
 *
 */
export class ModelImpl extends MetaTypeImpl {
    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'MODEL',
            serialize: ({ targetObject }: SerializeMetaTypeArgsType) => {
                return getModel(targetObject!)
            }
        })
        this.builtinDeSerializers.push({
            name: 'ReadOnlyMODEL',
            deserialize: () => {
                return
            }
        })
    }

    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'MODEL' }
    }

    override metaTypeValidatorFunc() {
        return false
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================

/**
 * Creates a dynamic property that returns the model object.
 *
 * @example
 * Usage example:
 *
 * ```ts
 * class User {
 *   model = MODEL()
 * }
 *
 * class UserWithProfile extends User {
 *   name = ''
 * }
 *
 * const [state] = StateManager.getOrCreateState(UserWithProfile, { key: 'user1' })
 * const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)
 *
 * console.log(stateProxy.model) // UserWithProfile
 *
 * ```
 *
 * @returns The metatype for reading the model object.
 */
export function MODEL(): StateModel {
    return MetaType(ModelImpl, {})
}
