import { EventsManager } from '../EventsManager'

export type OnUnmountHandler = (state: any) => any

/**
 * OnUnmount is an event that is triggered when a state proxy is unmounted.
 */
export const OnUnmount = EventsManager.newEvent<OnUnmountHandler>('OnUnmount')
