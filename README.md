# Async Library - Asynchronous UI Components

Async Library is a framework for building UI components with asynchronous data needs. It defines the essential asynchronous state machine and properties. It aims to handle various [use cases](https://github.com/async-library/future/issues/3), implemented as core features or through integrations. It builds on [React Async](https://github.com/async-library/react-async), but avoids coupling to a specific UI library or state management solution.

This repo exists to discuss and build the future version of [React Async](https://github.com/async-library/react-async) and [react-async-hook](https://github.com/slorber/react-async-hook). Async Library is the overarching project where these will come together.

**We are looking for collaborators.**
Join the chat on [Discord](https://discord.gg/CAYQ6mU).

Project goals:
- Create a unified package to serve as a replacement for react-async, react-async-hook, react-hooks-async and others.
- Implement this in such a way that it can be easily extended to cover additional use cases and libraries.
- The core should not care about the UI library (React, Vue, Svelte) or state management (Redux, Mobx, Vuex).
- Integrations will provide idiomatic APIs for various UI libraries, state managers and data fetching libraries.

See [issues](https://github.com/async-library/future/issues) for topics under discussion.
