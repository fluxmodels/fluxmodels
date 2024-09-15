import { MetaType, MetaTypeImpl } from 'metatyper'
import { type StateType } from './StateManager'

const EventsHandlersSymbol = Symbol.for('[[EventsHandlers]]')

export type HandlerType = (...args: any[]) => any

/**
 * Type representing an event that can be subscribed to.
 *
 * @template T - The type of the handler function.
 */
export type Event<T extends HandlerType> = {
    readonly _isEvent: true

    <HandlerT extends T>(handler: HandlerT): HandlerT
    <HandlerT extends T = T>(): HandlerDecoratorType<HandlerT>
}

/**
 * Type representing the decorator function for event handlers.
 *
 * @template T - The type of the handler function.
 */
type HandlerDecoratorType<T> = (
    targetObject: object,
    propName: string,
    descriptor: TypedPropertyDescriptor<T>
) => void

/**
 * Class responsible for managing events and their handlers.
 *
 * @template T - The type of the state object.
 */
export class EventsManager<T extends Record<keyof any, any>> {
    /**
     * @param state - The state object to manage events for.
     */
    constructor(public readonly state: StateType<T>) {
        if (!state[EventsHandlersSymbol]) {
            Object.defineProperty(state, EventsHandlersSymbol, {
                value: new Map(),
                writable: false,
                enumerable: false,
                configurable: true
            })
        }
    }

    getHandlers<T extends HandlerType>(event: Event<T>): Set<HandlerType> {
        const handlersMap = this.state[EventsHandlersSymbol] as Map<any, Set<HandlerType>>

        let handlers = handlersMap.get(event)

        if (!handlers) {
            handlers = new Set()
            handlersMap.set(event, handlers)
        }

        return handlers
    }

    /**
     * Emits an event with the specified arguments and optional context.
     *
     * @param event - The event to emit.
     * @param args - The arguments to pass to the event handlers.
     * @param _this - The context object to use when calling the event handlers.
     */
    emit<T extends HandlerType>(event: Event<T>, args?: Parameters<T>, _this?: T) {
        for (const handler of this.getHandlers(event)) {
            handler.apply(_this ?? this.state, args ?? [])
        }
    }

    /**
     * Subscribes a handler to an event.
     *
     * @param event - The event to subscribe to.
     * @param handler - The handler to subscribe.
     */
    subscribe<T extends HandlerType>(event: Event<T>, handler: T) {
        if (event && handler) this.getHandlers(event).add(handler)
    }

    /**
     * Unsubscribes a handler from an event.
     *
     * @param event - The event to unsubscribe from.
     * @param handler - The handler to unsubscribe.
     */
    unsubscribe<T extends HandlerType>(event: Event<T>, handler: T) {
        if (event && handler) this.getHandlers(event).delete(handler)
    }

    /**
     * Creates a new event with the specified name.
     *
     * @param name - The name of the event.
     * @returns The new event.
     */
    static newEvent<T extends HandlerType = HandlerType>(name?: string) {
        function HandlerDecorator(
            targetObject: object,
            _propName: string,
            descriptor: TypedPropertyDescriptor<HandlerType>
        ) {
            const eventsManager = new EventsManager(targetObject as StateType<object>)

            eventsManager.subscribe(Event, descriptor.value!)
        }

        const eventFunc = function (handler?: HandlerType): any {
            if (handler) {
                const newType = MetaType(EventsHandlerImpl, { subType: [Event, handler] })

                return newType
            } else {
                return HandlerDecorator
            }
        }

        Object.defineProperties(eventFunc, {
            _isEvent: { writable: false },
            name: { value: name, enumerable: true, configurable: true }
        })

        const Event = eventFunc as Event<T>

        return Event
    }
}

/**
 * Represents a metatype used in the metatyper type system for registering event handlers.
 *
 * This class is used to define and handle events within the FluxModels framework.
 * It allows for the creation of strongly-typed event handlers that can be easily
 * integrated into model definitions.
 *
 * @example
 * ```typescript
 * const model = {
 *     // Define an event handler using the OnMount metatype
 *     onMount: OnMount(() => {
 *         console.log('Model mounted');
 *     })
 * }
 * ```
 *
 * In this example, 'OnMount' is a metatype similar to other metatyper types like 'NUMBER()'.
 * It's used to define an event handler that will be called when the model is mounted.
 */
class EventsHandlerImpl extends MetaTypeImpl {
    override configure() {
        this.builtinDeSerializers.push({
            name: 'RegisterHandler',
            deserialize: ({ targetObject }) => {
                const [event, handler] = this.getSubType()

                if (targetObject) {
                    const eventsManager = new EventsManager(targetObject as StateType<object>)

                    eventsManager.subscribe(event, handler)
                }

                return handler
            },
            deserializePlaces: ['init']
        })
    }
}
