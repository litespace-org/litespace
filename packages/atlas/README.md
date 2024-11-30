# Atlas (Moon of Saturn)

This package can be considered as an API that facilitates communication between the backend and the frontend applications. It can be seen as well as an SDK contains a set of tools and features that are used in different parts of the software (LiteSpace).

## Main Dependencies

Atlas inner packages dependencies:
- [types](../types/README.md)

Atlas outer dependencies:
- [Axios](https://www.npmjs.com/package/axios)

## Overview (Developer Guide)

### The Base Class

`src/base.ts` is the main component/class that couples together 'atlas' and Axios. You may think of it as wrapper to Axios.

### Derived Classes

These are the main tools that 'atlas' provides to other components/packages in LiteSpace. They are located in `src/derived` directory, and they inherit from the base class.

### The Atlas Class

`src/atlas.ts` is just a facade of all the aforementioned derived classes.

### Configs

`src/configs.ts` defines configuration variables, for different env modes (i.e. staging), that shall be used by the aforementioned derived classes.

### Types

`src/types.ts` defines all the types that ought to be used in 'atlas'.

> It may be moved to [the types package](../types/README.md); as it's being used as well outside 'atlas'.

### Lib

`src/lib` directory contains ancillary functions that supports the primary operations activities in other 'atlas' components/classes/files.
