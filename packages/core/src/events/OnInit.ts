import { EventsManager } from '../EventsManager'

export type OnInitHandler = (state: any) => any

/**
 * OnInit is an event that is triggered when a state is initialized.
 */
export const OnInit = EventsManager.newEvent<OnInitHandler>('OnInit')
