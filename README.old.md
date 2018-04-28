# Patchinko [![Build Status](https://travis-ci.org/barneycarroll/patchinko.svg?branch=master)](https://travis-ci.org/barneycarroll/patchinko)

A tool for making deep & subtle mutations on - or modified copies of - Javascript structures. State updates, [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch), and more are a breeze with Patchinko.

Throw your rose-tinted [lenses](https://medium.com/javascript-inside/an-introduction-into-lenses-in-javascript-e494948d1ea5), [reducers](http://redux.js.org/docs/basics/Reducers.html) & [decorators](https://tc39.github.io/proposal-decorators/) out the window: Patchinko is an ECMAScript3-compliant utility that makes complex patching fast and easy, without the ceremony.

# What

## Explicit

Patchinko exposes 4 explicit APIs: `P`, `S`, `PS`, & `D`.

`P` is like `Object.assign`: given `P(target, input1, input2, etc)`, it consumes inputs left to right and copies their properties onto the supplied target

*…except that…*

If any target properties are instances of `S(function)`, it will supply the scoped function with the target property for that key, and assign the result back to the target.

If any target properties are `D`, it will delete the property of the same key on the target.

`PS([ target, ] input)` is a composition of `P` & `S`, for when you need to patch recursively. If you supply a `target`, the original value will be left untouched (useful for immutable patching).

## Overloaded

Patchinko also comes with a don't-make-me-think single-reference overloaded API - useful when the essential patching operations are intuitive but the different API invocations are cognitively overbearing to determine or noisy to read.

`O` is an overloaded API that subsumes the above (with the exception of the n-ary immutable `PS` overload):

1. No arguments stands in for `D`.
2. A function argument stands in for `S`.
3. A non-function single argument stands in for `PS`.
4. …otherwise, `P`.

## Immutable

In practice, Patchinko works best overloaded: it favours a do-what-I-mean approach where the Patchinko API disappears into the background. But the `PS` overload heuristics mean that convenience comes at the cost of immutable workflows. You can instead use an immutable variation of the overloaded API that always shallow clones the target for paths 3 & 4. *But* the simplistic cloning heuristics involved mean that these paths can only operate predictably if the target (3) or target property (4) is a plain object, array, string, number, boolean or 'undefined'. This mode is best suited to flux-like 'unidirectional data-flow' state creation workflows.

# Where

Supplied in CommonJS module format & as unscoped top-level references. Available on [npm](https://npmjs.org/package/patchinko) & [UNPKG cdn](https://unpkg.com/patchinko).

In Node:

```js
const {P, S, PS, D} = require('patchinko')
// or
const O = require('patchinko/overloaded')
// or
const O = require('patchinko/immutable')
```

In the browser:

```html
<script src=//unpkg.com/patchinko></script>
<script>console.log({P, S, PS, D})</script>
<!-- or -->
<script src=//unpkg.com/patchinko/overloaded></script>
<script>console.log({O})</script>
<!-- or -->
<script src=//unpkg.com/patchinko/immutable></script>
<script>console.log({O})</script>
```

# How

The kitchen sink example:

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

Using the overloaded API, the same results are achieved as follows:

```js
const O = require('patchinko/overloaded')

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

# Why

Patchinko was originally written to help monkey-patch an incredibly unwieldy piece of legacy code written in abject-oriented style - [CKEDITOR](https://docs.ckeditor.com/#!/api) to be precise. The code in question consisted of large, obtuse and inflexible configurations and interlinked method references, which was difficult enough to interpret in the first place. By using Patchinko, the necessarily cumbersome patch ressembles the structure it seeks to patch with minimum ceremony, freeing up head space to consider the intricacies of the problem API rather than the mundane difficulty of patching correctly in the first place.

# But

Monkey-patching is a recondite use case. Most applications of siginificant complexity will at some point face difficulties in state management. People argue the toss about the merits of mutability, different communication patterns, etc - in my opinion the key value of 'reducers', 'actions', 'lenses' etc is only really beneficial inasmuch as the ceremony of designing & writing such things distracts the brain from otherwise loose creativity, and limits the number of ways in which you might be tempted to interact with state, for the mundane reason that the more ways in which state can / is modified, the harder code is to reason about.

Patchinko eases that burden by providing a declarative, recursive, function-oriented pattern with a simple & flexible API. Mutating state with Patchinko is safer because it provides an easy way to do so safely, without insisting on heavy-handed, exotic new concepts or obnoxious restrictions. Moreover, a Patchinko patch is isomorphic inasmuch as it resembles the object it patches - in stark contrast to reducers, actions & lenses where any given use instance has more in common with every other use instance than it does the transaction / data it represents.
