import {
    MetaType,
    MetaTypeImpl,
    type MetaTypeArgsType,
    type SerializeMetaTypeArgsType
} from 'metatyper'

import { StateStore } from '../StateStore'
import { getStore } from '../utils'

/**
 * This is the implementation of the STORE metatype (metatyper).
 * This class contains the logic for getting the store instance where the state is stored.
 *
 */
export class StateStoreImpl extends MetaTypeImpl {
    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'STORE',
            serialize: ({ targetObject }: SerializeMetaTypeArgsType) => {
                return getStore(targetObject!)
            }
        })
        this.builtinDeSerializers.push({
            name: 'ReadOnlySTORE',
            deserialize: () => {
                return
            }
        })
    }

    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'STORE' }
    }

    override metaTypeValidatorFunc() {
        return false
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================

/**
 * Creates a dynamic property that returns the StateStore instance where the state is stored.
 *
 * @example
 * Usage example:
 *
 * ```ts
 * class User {
 *   store = STORE()
 *
 *   usersCount(){
 *     return this.store.findStates(User).length
 *   }
 * }
 *
 * const MyComponent = (props) => {
 *   const [user] = useModel(User, { key: props.userId })
 *
 *   return (
 *     <div>
 *       <h1>Users Count: {user.usersCount()}</h1>
 *     </div>
 *   )
 * }
 *
 * ```
 *
 * @returns The metatype for reading the state's store.
 */
export function STORE(): StateStore {
    return MetaType(StateStoreImpl, {})
}
