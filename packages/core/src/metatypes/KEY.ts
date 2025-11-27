import { MetaType, StringImpl, type MetaTypeArgsType } from 'metatyper'

import { getKey } from '../utils'

import { type StateKey } from '../types'
import { DEFAULT_STATE_KEY } from '../constants'

/**
 * Implementation of the KEY metatype (metatyper).
 * Provides logic for reading the state's key in a type-safe way.
 */
export class StateKeyImpl extends StringImpl {
    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'KEY',
            serialize: ({ targetObject }) => {
                if (!targetObject) {
                    return DEFAULT_STATE_KEY
                }

                return getKey(targetObject!)
            }
        })
        this.builtinDeSerializers.push({
            name: 'ReadOnlyKEY',
            deserialize: () => {
                return
            }
        })
    }

    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'KEY' }
    }

    override metaTypeValidatorFunc() {
        return false
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================

/**
 * Creates a dynamic property that returns a key of the state.
 *
 * @example
 * Usage example:
 *
 * ```ts
 * class User {
 *   id = KEY()
 * }
 *
 * const [state] = StateManager.getOrCreateState(User, { key: 'user1' })
 * const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)
 *
 * console.log(stateProxy.id) // 'user1'
 *
 * ```
 *
 * @returns The metatype for reading the state's key.
 */
export function KEY(): StateKey {
    return MetaType(StateKeyImpl, {})
}
