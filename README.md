# Patchinko

A tool for making deep & subtle mutations on Javascript structures. State updates, monkey-patching, and more are a breeze with Patchinko.

Through your rose-tinted lenses, reducers & decorators out the window: Patchinko is an ECMAScript3-compliant utility that makes complex patching fast and easy, without the ceremony.

# What

Patchinko exposes 3 functions: `patch`, `scope`, & `ps`.

`patch` is like `Object.assign` - given `patch(target, input1, input2, etc)`, it consumes inputs left to right and copies their properties onto the supplied target.

*except that*

If any target properties are instances of `scope(function)`, it will supply the scoped function with the target property for that key, and assign the result back to the target.

`ps` is a composition of `patch` & `scope`, for when you need to patch recursively.

# How

The kitchen sink example:

```js
import {patch as p, scope as s, ps} from 'patchinko'

// Some arbitrary structure
const thing = {
  foo: 'bar',

  fizz: 'buzz',

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
    }
  }
}

// A deep patch
p(thing, {
  foo: 'baz', // Change the value of foo

  utils: ps({ // We want to patch a level deeper
    fibonacci: s(function closure(definition){ // Memoize fibonacci
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

  stupidly: ps({
    deep: ps({
      structure: s(structure =>
        structure.concat('roflmao') // Why not
      )
    })
  })
})
```

* Thing is mutated in place.
* Properties unspecified in the patch input are unaffected
* Fibonacci can safely be decorated (again, the rest of utils is unaffected)
* `stupidly.deep.structure` can be modified, keeping its identity

`stupidly.deep.structure` is an example of
