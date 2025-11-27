<div align="center" class="cover">

[![FluxModels](https://raw.githubusercontent.com/fluxmodels/fluxmodels/main/docs/images/cover.png)](https://docs.fluxmodels.dev/)

type-safe state management

---

[![npm react](https://img.shields.io/npm/v/@fluxmodels/react?style=flat&labelColor=202020&label=NPM(React))](https://www.npmjs.com/package/@fluxmodels/react) [![website](https://img.shields.io/badge/Docs-fluxmodels.dev-2ea845?style=flat&labelColor=202020)](https://docs.fluxmodels.dev/) [![license: MIT](https://img.shields.io/badge/License-MIT-00aa00.svg?style=flat&labelColor=202020)](https://opensource.org/licenses/MIT) [![donate](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=flat&labelColor=202020)](https://paypal.me/vadzimsharai)

</div>

&nbsp;

# Introduction

FluxModels is a modern TypeScript-first state management library created for one simple reason: **too much boilerplate code**. The aim is to separate data from rendering logic and to let developers use JavaScript besides TypeScript in a natural way - without extra abstractions or the need to learn another paradigm.

## Why FluxModels exists

Modern state tools often force developers to
- Write repetitive code
- Learn framework-specific patterns that feel foreign to vanilla JS/TS
- Blur the lines between your data layer and UI layer

FluxModels rests on a simple idea - you write ordinary TypeScript. You use classes, methods and plain objects. The library still gives you reactivity, validation and all the other benefits of modern state management libraries.

## What FluxModels delivers

- ✨ **Minimal boilerplate**: declare your data schemas once and wire them everywhere without repetitive glue code.
- 🧩 **Familiar TS/JS ergonomics**: interact with plain objects, classes, and methods so state code reads like idiomatic TypeScript—no special wrappers or abstractions.
- 🛡️ **Type-safe from dev to prod**: TypeScript typings plus automatic `runtime validation` keep every state consistent.
- ⚡ **Granular performance tuning**: intelligent diffing and selective updates prevent unnecessary renders.
- 🔄 **First-class async support**: orchestrate effects, background tasks, and streaming updates without extra layers.
- 🎯 **Clear separation of concerns**: keep your data logic separate from your rendering logic, making both easier to reason about and test.
- 💉 **Built-in dependency injection**: seamlessly connect related states without complex DI frameworks, manual wiring, or learning unfamiliar paradigms.

FluxModels is more than a store - it is a cohesive state platform that keeps codebases clean, predictable and ready for the next feature, while letting JavaScript or TypeScript work as intended.

&nbsp;

# Installation

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

# Basic Usage

## Simple Example

[![Open in CodeSandbox](https://img.shields.io/badge/Open_in-CodeSandbox-151515?logo=codesandbox&logoColor=white)](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-1-hpf55z?fontsize=14&hidenavigation=1&theme=dark)

```tsx
import { useModel, STRING, PASSWORD, OnError } from '@fluxmodels/react'

class UserModel {
    username = STRING({ default: "", maxLength: 12 })
    password = PASSWORD({ default: "", safe: false })  
    // safe=false: allows state updates even when validation fails (useful for form inputs)

    randomField = 'any string'

    updatePassword(password) {
        this.password = password
    }

    @OnError()
    onError({ error }){
        // you can handle validation errors here
        console.error(error)
    }
}


function Example() {
    const [user, updateUser] = useModel(UserModel)

    const onChangeUsername = (username) => {
        // state can be updated using the update function (works like useState in React)

        try{
            updateUser({ username })
        }catch(e){
            // you can also handle the error here
        }
    }

    const onChangePassword = (password) => {
        // state can be updated using model methods as well

        // No try-catch needed: password field has safe=false, 
        // so it won't throw errors
        user.updatePassword(password)
    }

    const changeWithoutRerender = () => {
        // This will update the state, but won't trigger a re-render of this component
        // because randomField is not an observable property.
        // Properties become observable only when they are accessed in the component
        // or explicitly provided in the useModel hook
    
        updateUser({ randomField: 'new value' })
    }

    const changeWithError = () => {
        // This will throw a validation error because randomField expects a string,
        // but we're trying to update it with a number value

        try{
            updateUser({ randomField: 123 })
        }catch(e){
            console.error(e)
        }
    }

    return <>
        <input
            value={user.username}
            onChange={(e) => onChangeUsername(e.target.value)}
        />
        
        <input
            type='password'
            value={user.password}
            onChange={(e) => onChangePassword(e.target.value)}
        />
        
        <button onClick={changeWithoutRerender}>
            Update without rerender
        </button>
        
        <button onClick={changeWithError}>
            Update with error
        </button>
    </>
}

export default function App() {
    return <Example />
}
```

&nbsp;

## Injected States Example

[![Open in CodeSandbox](https://img.shields.io/badge/Open_in-CodeSandbox-eaff96?logo=codesandbox&logoColor=white)](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-2-dr5c7w?fontsize=14&hidenavigation=1&theme=dark)


```tsx
import React from 'react'
import {
    useModel,
    InjectModel,
    KEY,
    STRING,
    ValidationError,
    type StateSnapshot,
} from '@fluxmodels/react'

// ==================================================================================================
// ============================================= Models =============================================
// ==================================================================================================

class TodoItemState {
    id = KEY()
    text = STRING()
    completed = false

    projectState = InjectModel(ProjectState)

    toggle() {
        this.completed = !this.completed
    }

    remove() {
        this.projectState.removeTodo(this.id)
    }
}

class ProjectState {
    todoList = InjectModel([TodoItemState], {
        // The 'id' field is used as a key for state management
        // When assigning, the value of this field is used as a key to find the state in the store
        keyResolver: 'id'
    })

    get completedCount() {
        return this.todoList.filter((todo) => todo.completed).length
    }

    addTodo(text: string) {
        const newTodo = {
            id: Math.random().toString(36).substring(2, 15),
            text
        } as TodoItemState

        this.todoList = [
            ...this.todoList,
            newTodo
        ]
    }

    removeTodo(id: string) {
        this.todoList = this.todoList.filter((todo) => todo.id !== id)
    }
}

const TodoAddUIState = {
    error: '',
    todoName: STRING({ default: '', trim: true, maxLength: 16 }),

    projectState: InjectModel(ProjectState),

    handleTodoNameChange(todoName: string) {
        this.error = ''

        try {
            this.todoName = todoName
        } catch (error) {
            if (error instanceof ValidationError) {
                this.error = error.issues.map((issue) => {
                    switch (issue.code) {
                        case 'MaxLength':
                            return `Name must be at most ${issue.validator.context?.maxLength} characters long`
                        default:
                            return issue.message
                    }
                }).join(', ')
            } else {
                throw error
            }
        }
    },

    handleTodoAdd() {
        if (this.todoName) {
            this.projectState.addTodo(this.todoName)
            this.handleTodoNameChange('')
        }
    }
}

// ==================================================================================================
// =========================================== Components ===========================================
// ==================================================================================================

function TodoAddComponent() {
    const [{ todoName, error, handleTodoNameChange, handleTodoAdd }] = useModel(TodoAddUIState)

    return (
        <>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={todoName}
                    onChange={(e) => handleTodoNameChange(e.target.value)}
                    placeholder={`Add a new todo...`}
                    style={{ flex: 1, padding: '8px' }}
                />
                <button onClick={handleTodoAdd} style={{ padding: '8px 16px' }}>Add</button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        </>
    )
}

function TodoItemComponent({ todoItemState }: { todoItemState: StateSnapshot<TodoItemState> }) {
    // Alternative: pass todoItemId as prop and retrieve state with useModel
    // const [todoItemState] = useModel(TodoItemState, { key: todoItemId })

    return (
        <div key={todoItemState.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', width: '100%' }}>
                <input
                    type="checkbox"
                    checked={todoItemState.completed}
                    onChange={() => todoItemState.toggle()}
                />
                <span style={{ textDecoration: todoItemState.completed ? 'line-through' : 'none' }}>
                    {todoItemState.text}
                </span>
            </div>

            <button onClick={() => todoItemState.remove()} style={{ padding: '4px 8px' }}>
                Delete
            </button>
        </div>
    )
}

function TodoListComponent() {
    const [projectState] = useModel(ProjectState)

    return (
        <div style={{ marginBottom: '20px' }}>
            {projectState.todoList.map((todoItemState) => (
                <TodoItemComponent key={todoItemState.id} todoItemState={todoItemState} />
            ))}
        </div>
    )
}

function TodoStatsComponent() {
    const [projectState] = useModel(ProjectState)

    return (
        <div style={{ marginTop: '20px', padding: '10px' }}>
            Total: {projectState.todoList.length} |
            Completed: {projectState.completedCount}
        </div>
    )
}

export default function App() {
    return (
        <div style={{ padding: '20px', margin: '0 auto', maxWidth: '384px' }}>
            <h1>TODO List</h1>

            <TodoAddComponent />
            <TodoListComponent />
            <TodoStatsComponent />
        </div>
    )
}
```

&nbsp;

# Documentation

For full documentation, visit [fluxmodels.dev](https://docs.fluxmodels.dev/).
