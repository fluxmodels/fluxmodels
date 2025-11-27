import { MetaType, MetaTypeImpl } from 'metatyper'

import { isPromiseLike } from './utils'
import { EventsHandlersSymbol } from './constants'
import { type AnyRecord, type Event, type EventHandler, type State } from './types'

/**
 * Class responsible for managing events and their handlers.
 *
 */
export class EventsManager {
    readonly targetObject: AnyRecord

    /**
     * @param targetObject - The targetObject object to manage events for.
     */
    constructor(targetObject: AnyRecord) {
        this.targetObject = targetObject

        if (!Object.hasOwn(targetObject, EventsHandlersSymbol)) {
            Object.defineProperty(targetObject, EventsHandlersSymbol, {
                value: new Map(),
                writable: false,
                enumerable: false,
                configurable: true
            })
        }
    }

    protected _getOwnHandlers(event: Event<EventHandler>, targetObject?: AnyRecord) {
        if (!targetObject) {
            targetObject = this.targetObject
        }

        if (!Reflect.has(targetObject, EventsHandlersSymbol)) {
            return undefined
        }

        const handlersMap: Map<any, Set<EventHandler>> | undefined =
            targetObject[EventsHandlersSymbol]

        if (!handlersMap || !(handlersMap instanceof Map)) {
            return undefined
        }

        let handlersSet = handlersMap.get(event)

        if (!handlersSet) {
            handlersSet = new Set()
            handlersMap.set(event, handlersSet)
        }

        return handlersSet
    }

    /**
     * Returns the handler set for a given event, creating it if necessary.
     *
     * @param event - The event whose handlers set is requested.
     * @returns A mutable set of handlers for the event.
     */
    getHandlers<T extends EventHandler>(event: Event<T>) {
        const handlersSet = new Set<EventHandler>()

        let proto = this.targetObject

        while (proto) {
            const ownHandlers = this._getOwnHandlers(event, proto)

            if (ownHandlers) {
                for (const handler of ownHandlers) {
                    handlersSet.add(handler)
                }
            }

            proto = Object.getPrototypeOf(proto)
        }

        return handlersSet
    }

    /**
     * Emits an event with the specified arguments and optional context.
     *
     * @param event - The event to emit.
     * @param args - The arguments to pass to the event handlers.
     * @param _this - The context object to use when calling the event handlers.
     */
    emit<T extends EventHandler>(event: Event<T>, args?: Parameters<T>, _this?: object) {
        const promises: Promise<any>[] = []

        for (const handler of this.getHandlers(event)) {
            const result = handler.apply(_this ?? this.targetObject, args ?? [])

            if (isPromiseLike(result)) {
                promises.push(result)
            }
        }

        return promises.length > 0 ? Promise.all(promises) : undefined
    }

    /**
     * Subscribes a handler to an event.
     *
     * @param event - The event to subscribe to.
     * @param handler - The handler to subscribe.
     */
    subscribe<T extends EventHandler>(event: Event<T>, handler: T) {
        if (event && handler) {
            const ownHandlers = this._getOwnHandlers(event)

            if (ownHandlers) {
                ownHandlers.add(handler)

                return true
            }
        }

        return false
    }

    /**
     * Unsubscribes a handler from an event.
     *
     * @param event - The event to unsubscribe from.
     * @param handler - The handler to unsubscribe.
     */
    unsubscribe<T extends EventHandler>(event: Event<T>, handler: T) {
        if (event && handler) {
            const ownHandlers = this._getOwnHandlers(event)

            if (ownHandlers) {
                ownHandlers.delete(handler)

                return true
            }
        }

        return false
    }

    /**
     * Creates a new event with the specified name.
     *
     * @param name - The name of the event.
     * @returns The new event.
     */
    static newEvent<T extends EventHandler = EventHandler>(name?: string) {
        function HandlerDecorator(
            targetObject: object,
            _propName: string,
            descriptor: TypedPropertyDescriptor<EventHandler>
        ) {
            const eventsManager = new EventsManager(targetObject as any)

            eventsManager.subscribe(Event, descriptor.value!)
        }

        const eventFunc = function (handler?: EventHandler): any {
            if (handler) {
                return MetaType(EventsHandlerImpl, { subType: [Event, handler] })
            } else {
                return HandlerDecorator
            }
        }

        Object.defineProperties(eventFunc, {
            _isEvent: { value: true, writable: false },
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
 *
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
                    const eventsManager = new EventsManager(targetObject as State<object>)

                    eventsManager.subscribe(event, handler)
                }

                return handler
            },
            deserializePlaces: ['init']
        })
    }
}
