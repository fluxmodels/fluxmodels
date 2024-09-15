import { EventsManager } from '../EventsManager'

export type OnChangeHandlerArgsType = {
    state: any
    propName: string | symbol
    prevValue: any
    newValue: any
}
export type OnChangeHandlerType = (args: OnChangeHandlerArgsType) => any

/**
 * OnChange is an event that is triggered when a state changes.
 *
 * @example
 *
 * ```ts
 * class Model {
 *     @OnChange()
 *     changeHandler(args: OnChangeHandlerArgsType) {
 *         // will be called when states changes
 *         console.log(args)
 *     }
 * }
 *
 * // or
 *
 * const Model = {
 *     changeHandler: OnChange((args: OnChangeHandlerArgsType) => {
 *         // will be called when states changes
 *         console.log(args)
 *     })
 * }
 * ```
 */
export const OnChange = EventsManager.newEvent<OnChangeHandlerType>('OnChange')
