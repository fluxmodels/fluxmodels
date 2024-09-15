import { EventsManager } from '../EventsManager'

export type OnMountHandler = (state: any) => any

/**
 * OnMount is an event that is triggered when a state proxy is mounted.
 */
export const OnMount = EventsManager.newEvent<OnMountHandler>('OnMount')
