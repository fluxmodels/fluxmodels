import { NUMBER } from 'metatyper'

import {
    KEY,
    MODEL,
    STORE,
    DEFAULT_STATE_KEY,
    StateManager,
    StateProxyManager,
    StateStore
} from '../../src'

describe('InjectStateInfo metatypes', () => {
    it('should expose the state key via KEY()', () => {
        class Inner {
            id = KEY()
            value = NUMBER({ default: 0 })
        }

        const [state] = StateManager.getOrCreateState(Inner, { key: 'inner-1' })
        const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

        expect(proxy.id).toBe('inner-1')
    })

    it('should fall back to the default key symbol when key is not provided', () => {
        class Inner {
            id = KEY()
        }

        const [state] = StateManager.getOrCreateState(Inner)
        const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

        expect(proxy.id).toBe(DEFAULT_STATE_KEY)
    })

    it('should expose the model via MODEL()', () => {
        class Inner {
            model = MODEL()
        }

        const [state] = StateManager.getOrCreateState(Inner)
        const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

        const originalModel = StateManager.instance(state)?.model

        expect(typeof proxy.model).toBe('function')
        expect(typeof originalModel).toBe('function')
        expect((proxy.model as { name: string }).name.replace(/^bound\s+/i, '')).toBe(
            (originalModel as { name: string }).name
        )
    })

    it('should expose the store via STORE()', () => {
        class Inner {
            store = STORE()
        }

        const customStore = new StateStore()
        const [state] = StateManager.getOrCreateState(Inner, { store: customStore })
        const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

        expect(proxy.store).toBe(customStore)
    })
})
