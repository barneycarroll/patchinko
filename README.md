# Patchinko [![Build Status](https://travis-ci.org/barneycarroll/patchinko.svg?branch=master)](https://travis-ci.org/barneycarroll/patchinko)

A tool for making deep & subtle mutations on - or modified copies of - Javascript structures. State updates, [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch), and more are a breeze with Patchinko.

Throw your rose-tinted [lenses](https://medium.com/javascript-inside/an-introduction-into-lenses-in-javascript-e494948d1ea5), [reducers](http://redux.js.org/docs/basics/Reducers.html) & [decorators](https://tc39.github.io/proposal-decorators/) out the window: Patchinko is an ECMAScript3-compliant utility that makes complex patching fast and easy, without the ceremony.

* [What?](#what)
  * [Explicit](#explicit) or
  * [Overloaded](#explicit):
    * [Constant](#1-constant) or
    * [Immutable](#2-immutable)
* [Where?](#where)
* [How?](#how)
* [Why?](#why)
* [Troubleshooting](#troubleshooting)
* [Changelog](#changelog)

# What?

## Explicit

Patchinko exposes 4 explicit APIs: `P`, `S`, `PS`, & `D`. In general it's easier to work with the overloaded APIs, but explicit is instructive in getting a clear mental model of the different granular operations Patchinko performs under the hood.

* `P` is like `Object.assign`: given `P(target, input1, input2, etc)`, it consumes inputs left to right and copies their properties onto the supplied target, *except that:*
* If any target properties are instances of `S(function)`, it will supply the scoped function with the target property for that key, and assign the result back to the target;
* If any target properties are `D`, it will delete the property of the same key on the target;
* `PS([ target, ] input)` is a composition of `P` & `S`, for when you need to patch recursively. If you supply a `target`, the original value will be left untouched (useful for immutable patching).

## Overloaded

Patchinko also comes with a don't-make-me-think single-reference overloaded API - useful when the essential patching operations are intuitive but the different API invocations are cognitively overbearing to determine or noisy to read.

`O` is an overloaded API that subsumes the above (with the exception of the n-ary immutable `PS` overload):

* No arguments stands in for `D`
* A function argument stands in for `S`
* A non-function single argument stands in for `PS`
* …otherwise, `P`

The overloaded API comes in 2 flavours:

### 1. Constant

The 1st variation of the overloaded API assumes you want to mutate the `target`s you pass in to your top-level Patchinko call. In this case the `Object.assign` comparison holds true.

### 2. Immutable

The 2nd works on a more functional basis: the `target`s of each operation are left intact and any changes result in new objects being produced as the result of each operation. This is the immutable approach.

> #### ☝️ Why does it matter?
>
> If you're using Patchinko to monkey-patch an arbitrary third party API, you almost certainly want to mutate it: complex APIs may use 'instanceof' and equality reference checks internally; if you're patching a class / prototypal construct with internal and external references across the code-base, you need to preserve those references in order for everything to work as expected.
>
> But if you're using Patchinko to make changes to a data structure that's the sole business of your application's data model, that kind of stuff shouldn't be necessary - you can and should certainly avoid those patterns (they're complex and brittle!). In this scenario, creating new objects instead of mutating old ones can make the development & debugging process significantly easier:
>
> * Because the result of each patch operation is a new entity, you can store the results as new references and compare them later on. This can be useful when you want to see how a model has changed step by step over the course of several operations.
> * Because nested structures within the patched entity that *haven't* been individually patched will retain their old identity, you an use [memoization](https://en.wikipedia.org/wiki/Memoization) to avoid unnecessary reactive computations. Traditionally this has been touted as a method for reactive Javascript applications - in particular virtual DOM libraries like [Mithril](https://mithril.js.org/) - to increase performance by skipping wasteful recomputations; but the salient advantage of this functionality is for debugging - you can set breakpoints far downstream in an application call graph and only pause script execution if and when change has occured.
>
> *When it comes to any defensive 'best practice' for the sake of performance - in the absence of any qualifiable evidence - the ability for authors & readers to reason & interact with the code lucidly should always be more jusdged more important to the architecture of code than any theories about what the computer might prefer.*

# Where?

Supplied as ECMAScript modules (ESM) with the `.mjs` extension, and as script files with CommonJS module exports and unscoped top-level references with `.js` extensions. Available on [NPM](https://npmjs.org/package/patchinko) & [UNPKG cdn](https://unpkg.com/patchinko). Patchinko's entry points `import` and `export` *all* APIs according to the environment module support: it is always preferable to explicitly reference the path of the desired API.

In Node:

```js
const {P, S, PS, D} = require('patchinko/explicit.js')

// or

const O = require('patchinko/constant.js')

// or

const O = require('patchinko/immutable.js')
```

With ESM:

```js
import {P, S, PS, D} from 'patchinko/explicit.mjs'

// or

import O from 'patchinko/constant.mjs'

// or

import O from 'patchinko/immutable.mjs'
```

In the browser:

```html
<script src=//unpkg.com/patchinko@4.1.0/explicit.mjs></script>
<script>console.log({P, S, PS, D})</script>

<!-- or -->

<script src=//unpkg.com/patchinko@4.1.0/overloaded.mjs></script>
<script>console.log({O})</script>

<!-- or -->

<script src=//unpkg.com/patchinko@4.1.0/immutable.mjs></script>
<script>console.log({O})</script>
```

# How?

Below is a kitchen sink straw man showing the full power of Patchinko in mutating complex Javascript objects.

For a holistic guide to using Patchinko as a tool for state management, please refer to [this excellent article on the Meiosis website](http://meiosis.js.org/wiki/03-Model-and-Nesting-C-Patchinko.html).

```js
// Some arbitrary structure
const thing = {
  foo: 'bar',

  fizz: 'buzz',

  bish: 'bash',

  utils: {
    mean: (...set) =>
      set.reduce((a, b) => a + b) / set.length,

    fibonacci(x){
      return x <= 1 ? x : this.fibonacci(x - 1) + this.fibonacci(x - 2)
    },
  },

  stupidly: {
    deep: {
      structure: ['lol']
    },
    with: ['a', 'list', 'tacked', 'on']
  }
}

// A deep patch
P(thing, {
  foo: 'baz', // Change the value of `foo`

  bish: D, // Delete property `bish`

  utils: PS({ // We want to patch a level deeper
    fibonacci: S(fibonacci => { // Memoize `fibonacci`
      const cache = {}

      return function(x){
        return (
          x in cache
          ? cache[x]
          : cache[x] = fibonacci.call(this, x)
        )
      }
    })
  }),

  stupidly: PS({
    deep: PS({
      structure: S(structure =>
        structure.concat('roflmao') // Why not
      )
    }),
    with: PS(
      [],
      {1: 'copy'}
    ) // ['a', 'copy', 'tacked', 'on'] - the original array is left untouched
  })
})
```

Observe that:

* `thing` is mutated in place.
* Properties unspecified in the patch input are unaffected
* `utils.fibonacci` can safely be decorated (again, the rest of `utils` is unaffected)
* `stupidly.deep.structure` can be modified, keeping its identity

`stupidly.deep.stucture` & `utils.fibonacci` show that any kind of structure can be modified or replaced at any kind of depth: `P` is geared towards the common case of objects, but `S` can deal with any type in whatever way necessary. You get closures for free so gnarly patch logic can be isolated at the point where it makes the most sense.

***

Using the overloaded constant API, the same results are achieved as follows:

```js
import O from 'patchinko/src/overloaded'

O(thing, {
  foo: 'baz',

  bish: O,

  utils: O({
    fibonacci: O(fibonacci => {
      const cache = {}

      return function(x){
        return (
          x in cache
          ? cache[x]
          : cache[x] = fibonacci.call(this, x)
        )
      }
    })
  }),

  stupidly: O({
    deep: O({
      structure: O(structure =>
        structure.concat('roflmao')
      )
    }),
    with: O(structure =>
      O([], structure, {1: 'copy'}) // [1]
    )
  })
})
```

[1️] The single-API overload forbids the immutable `PS` overload because more than 1 argument will necessarily fork to `P`. Thus immutable nested structure patching with `O` requires 2 invocations, 1 forking to `S` and the 2nd to `P`.

# Why?

Patchinko was originally written to help monkey-patch an incredibly unwieldy piece of legacy code written in abject-oriented style - [CKEDITOR](https://docs.ckeditor.com/#!/api) to be precise. The code in question consisted of large, obtuse and inflexible configurations and interlinked method references, which was difficult enough to interpret in the first place. By using Patchinko, the necessarily cumbersome patch ressembles the structure it seeks to patch with minimum ceremony, freeing up head space to consider the intricacies of the problem API rather than the mundane difficulty of patching correctly in the first place.

# But...

Monkey-patching is a recondite use case. Most applications of siginificant complexity will at some point face difficulties in state management. People argue the toss about the merits of mutability, different communication patterns, etc - in my opinion the key value of 'reducers', 'actions', 'lenses' etc is only really beneficial inasmuch as the ceremony of designing & writing such things distracts the brain from otherwise loose creativity, and limits the number of ways in which you might be tempted to interact with state, for the mundane reason that the more ways in which state can / is modified, the harder code is to reason about.

Patchinko eases that burden by providing a declarative, recursive, function-oriented pattern with a simple & flexible API. Mutating state with Patchinko is safer because it provides an easy way to do so safely, without insisting on heavy-handed, exotic new concepts or obnoxious restrictions. Moreover, a Patchinko patch is isomorphic inasmuch as it resembles the object it patches - in stark contrast to reducers, actions & lenses where any given use instance has more in common with every other use instance than it does the transaction / data it represents.

# Troubleshooting!

Patchinko is very terse - almost gnomic. While this can make highly expressive application code easier to read, it can also sometimes be hard to write. The following aren't hard and fast rules - there are legitimate and inventive use cases hiding behind every piece of generic 'bad practice' - but people have been confused by falling into these traps before. As a general rule, if your Patchinko code isn't behaving as expected, try to eliminate the following:

### Only use one of: explicit, constant or immutable in any pieces of shared code

Patchinko offers a single NPM package with single entry points that expose *all* APIs - but you should avoid mixing the 3 APIs within the same call graph: because recursive Patchinko operations rely on `instanceof` checks, code written in one will not be recognised in the other. This will result in broken patched objects.

When dealing with an ambiguous operation or getting to grips with Patchinko's different operations, it can be helpful to switch back and forth between the different APIs to better understand the mechanical distinctions – but this should be done piecemeal.

```js
// Avoid:
import {P, immutable as O} from 'patchinko'

P(x, { foo: O({ bar }) })

// Prefer:
import {P, PS} from 'patchinko'

P(x, { foo: PS({ bar }) })

// OR:
import {immutable as O} from 'patchinko'

O(x, { foo: O({ bar }) })
```

### Deeply recursive structures: how many times should I wrap with `O`?

Overloaded Patchinko can make complicated simple and simple easy, but there are also times when you lose sight of precisely what it's doing. The rule of thumb is that every nested object declaration in a Patchinko expression should be recursively wrapped - unless you wish to replace that object completely.

```js
// Correct:
O(x,   { foo: O({ bar: O({ bish:   'bash'  }) }) } )

// Also correct - but `bar` will not be patched - instead it will be replaced:
O(x,   { foo: O({ bar:   { bish:   'bash'  }  }) } )

// Incorrect - we can't patch `bar` because its container - `foo` is a wholesale replacement:
O(x,   { foo:   { bar: O({ bish:   'bash'  }) }  } )

// Incorrect - wrapping is only necessary for child structures - patch arguments will always patch, not replace:
O(x, O({ foo: O({ bar: O({ bish:   'bash'  }) }) }))

// Incorrect - primitive values cannot be patched:
O(x,   { foo: O({ bar: O({ bish: O('bash') }) }) } )
```

### Patchinko can't perform the kind of complex patch I need / I would really like to *sometimes* switch to explicit mode / How can I debug a nested patch operation?

Use `S` or `O(function)`. If you generally want the power of Patchinko's simplicity but at a certain point want to 'break out' into plain imperative Javascript - either to do something irreducibly more complex than a procedural patch; or because results aren't what you're expecting (or you just want to tap out to `console.log` or `debugger`) - you can always use the 'scope' operation to query the target value, run arbitrary code and / or return whatever value you want.

```js
O(x,   { foo: O({ bar: O(targetValue => {
  console.log(targetValue)

  debugger

  if(x)
    return y

  else
    return x
}) }) } )
```

Bear in mind you can't return `P`, `PS`, or `D` operations from `S`. This is never a blocker, except in the case of `D`.

***

# Changelog

## 4.1.0

* **Breaking:** API refactor
  * ECMAScript modules
  * `overloaded` renamed to `constant`
  * All API variants exposed via entry point
* Browser-based ESM tests (`.html` files in tests folder)
* Refactor tests to avoid symbols (they're unnecessary and misleading)
* Troubleshooting documentation (+ tweaks)
* Updated dependencies (+ API compliance tweaks)

## 3.2.2

Allow *deep* patch-scopes to empty targets (fix release).

## 3.2.0

Broken.

## ^3.1.0

Allow patching to `undefined`, `null` or absent targets

## ^3.0.0

Mutable & immutable single function `O` API via `/overloaded.js` & `/immutable.js` ([#8](https://github.com/barneycarroll/patchinko/issues/8))

## ^2.0.0

* API change to `{P, S, PS}`
* Delete directive `D`
* Ability for `PS` to consume an extra leading argument as target

## ^1.0.0

Patchinko published with explicit API of `{patch, scope, ps}`
