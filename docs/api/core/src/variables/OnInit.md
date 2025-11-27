[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
const OnInit: Event<OnInitHandler>;
```

Defined in: [core/src/events/OnInit.ts:49](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnInit.ts#L49)

Creates an event that fires when a state finishes initialization.

Handlers must satisfy [OnInitHandler](../type-aliases/OnInitHandler.md).

## Returns

Event used to subscribe to init notifications.

## Examples

```ts
class SessionModel {
    token = ''

    @OnInit()
    hydrate(args: OnInitArgs) {
        args.state.token = window.sessionStorage.getItem('token') ?? ''
    }
}
```

```ts
class UserProfileModel {
    name = ''
}
class UserModel {
    profile = InjectModel(UserProfileModel, { keyFrom: INJECT_KEY })

    @OnInit()
    async loadProfile(args: OnInitArgs) {
        args.state.profile = await fetch('/api/profile').then(r => r.json())
    }
}
```
