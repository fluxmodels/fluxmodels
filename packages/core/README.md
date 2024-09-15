<div align="center" class="cover">

[![FluxModels](https://raw.githubusercontent.com/fluxmodels/fluxmodels/main/docs/images/cover.png)](https://fluxmodels.dev/)

type-safe state management

---

[![npm core](https://img.shields.io/npm/v/@fluxmodels/core?style=flat&labelColor=202020&label=NPM(Core))](https://www.npmjs.com/package/@fluxmodels/core) [![website](https://img.shields.io/badge/Docs-fluxmodels.dev-2ea845?style=flat&labelColor=202020)](https://fluxmodels.dev/) [![license: MIT](https://img.shields.io/badge/License-MIT-00aa00.svg?style=flat&labelColor=202020)](https://opensource.org/licenses/MIT) [![donate](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=flat&labelColor=202020)](https://paypal.me/vadzimsharai)

</div>

&nbsp;

# Installation

React:

```bash
npm install @fluxmodels/core
# or
yarn add @fluxmodels/core
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

# Documentation

For full documentation, visit [fluxmodels.dev](https://docs.fluxmodels.dev/).
