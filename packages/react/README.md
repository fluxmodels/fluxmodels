<div align="center" class="cover">

[![FluxModels](https://raw.githubusercontent.com/fluxmodels/fluxmodels/main/docs/images/cover.png)](https://fluxmodels.dev/)

type-safe state management

---

[![npm react](https://img.shields.io/npm/v/@fluxmodels/react?style=flat&labelColor=202020&label=NPM(React))](https://www.npmjs.com/package/@fluxmodels/react) [![website](https://img.shields.io/badge/Docs-fluxmodels.dev-2ea845?style=flat&labelColor=202020)](https://fluxmodels.dev/) [![license: MIT](https://img.shields.io/badge/License-MIT-00aa00.svg?style=flat&labelColor=202020)](https://opensource.org/licenses/MIT) [![donate](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=flat&labelColor=202020)](https://paypal.me/vadzimsharai)

</div>

&nbsp;

# Installation

React:

```bash
npm install @fluxmodels/react
# or
yarn add @fluxmodels/react
```

&nbsp;

## TypeScript configuration

To use FluxModels with TypeScript, you need to enable experimental decorators and emit decorator metadata in your `tsconfig.json` file.

Add the following configurations:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        // ... other options
    }
}
```

These settings allow TypeScript to properly handle the decorators used in FluxModels and ensure full functionality of the library.

&nbsp;

# Basic Usage (React)

```jsx
import React from 'react'
import { useModel } from '@fluxmodels/react'

const UserModel = {
    username: ''
}

function UsernameInput() {
    const [user, updateUser] = useModel(UserModel)

    return <input 
        value={user.username} 
        onChange={(e) => 
            updateUser({ username: e.target.value })
        } 
    />
}

function App() {
    return <UsernameInput />
}
```

&nbsp;

More complex example:

```jsx
import React, { Suspense } from 'react'

import { STRING } from 'metatyper'
import { useModel, OnInit, UseSuspense, getKey } from '@fluxmodels/react'
```

```jsx
class UserModel {
    id = ''
    username = STRING({ maxLength: 12, default: '' })

    async loadUserData({ userID }) {
        // Here could be your API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const userData = {
            id: userID,
            username: 'user_' + userID
        }

        Object.assign(this, userData)
    }

    @OnInit() // calc this before render
    @UseSuspense() // will use Suspense until loaded
    async loadUser() {
        const userID = getKey(this)

        await this.loadUserData({ userID })
    }
}
```

```jsx
function UserComponent({ userID }) {
    const [user] = useModel(UserModel, { key: userID })

    return (
        <div>
            <p>ID: {user.id}</p>
            <p>Username: {user.username}</p>
            <br />
            <button onClick={() => user.loadUser()}>Load user again</button>
        </div>
    )
}
```

```jsx
function App() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <UserComponent userID="1" />
            <br />
            <UserComponent userID="2" />
        </Suspense>
    )
}
```

&nbsp;

# Documentation

For full documentation, visit [fluxmodels.dev](https://docs.fluxmodels.dev/).
