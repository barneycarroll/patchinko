# Patchinko [![Build Status](https://travis-ci.org/barneycarroll/patchinko.svg?branch=master)](https://travis-ci.org/barneycarroll/patchinko)

A tool for making deep & subtle mutations on Javascript structures. State updates, [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch), and more are a breeze with Patchinko.

Throw your rose-tinted [lenses](https://medium.com/javascript-inside/an-introduction-into-lenses-in-javascript-e494948d1ea5), [reducers](http://redux.js.org/docs/basics/Reducers.html) & [decorators](https://tc39.github.io/proposal-decorators/) out the window: Patchinko is an ECMAScript3-compliant utility that makes complex patching fast and easy, without the ceremony.

# What

Patchinko exposes 3 functions: `P`, `S`, & `PS`.

`P` is like `Object.assign`: given `P(target, input1, input2, etc)`, it consumes inputs left to right and copies their properties onto the supplied target

*…except that…*

If any target properties are instances of `S(function)`, it will supply the scoped function with the target property for that key, and assign the result back to the target; if any target properties are `D`, it will delete the property of the same key on the target.

`PS([ target, ] input)` is a composition of `P` & `S`, for when you need to patch recursively. If you supply a `target`, the original value will be left untouched (useful for immutable patching).

# How

The kitchen sink example:

```js
const {P, S, PS, D} = require('patchinko')

// Some arbitrary structure
const thing = {
  foo: 'bar',

  fizz: 'buzz',

  bish: 'bash',

  utils: {
    mean: (...set) =>
      set.reduce((a, b) => a + b) / set.length,

    fibonacci: function(x) {
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
    fibonacci: S(function closure(definition){ // Memoize `fibonacci`
      var cache = {}

      return function override(x){
        return (
          x in cache
          ? cache[x]
          : cache[x] = definition.apply(this, arguments)
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


# Why

Patchinko was originally written to help monkey-patch an incredibly unwieldy piece of legacy code written in abject-oriented style - [CKEDITOR](https://docs.ckeditor.com/#!/api) to be precise. The code in question consisted of large, obtuse and inflexible configurations and interlinked method references, which was difficult enough to interpret in the first place. By using Patchinko, the necessarily cumbersome patch ressembles the structure it seeks to patch with minimum ceremony, freeing up head space to consider the intricacies of the problem API rather than the mundane difficulty of patching correctly in the first place.

# But

Monkey-patching is a recondite use case. Most applications of siginificant complexity will at some point face difficulties in state management. People argue the toss about the merits of mutability, different communication patterns, etc - in my opinion the key value of 'reducers', 'actions', 'lenses' etc is only really beneficial inasmuch as the ceremony of designing & writing such things distracts the brain from otherwise loose creativity, and limits the number of ways in which you might be tempted to interact with state, for the mundane reason that the more ways in which state can / is modified, the harder code is to reason about.

Patchinko eases that burden by providing a declarative, recursive, function-oriented pattern with a simple & flexible API. Mutating state with Patchinko is safer because it provides an easy way to do so safely, without insisting on heavy-handed, exotic new concepts or obnoxious restrictions. Moreover, a Patchinko patch is isomorphic inasmuch as it resembles the object it patches - in stark contrast to reducers, actions & lenses where any given use instance has more in common with every other use instance than it does the transaction / data it represents.
