# Patchinko

A terse API for performing deep monkey-patching.

***

Particularly when dealing with monolithic, config-oriented, legacy Javascript APIs, we're forced to deal with large esoteric structures. The nature of these APIs makes configuration verbose and laborious at the best of times, and all but impossible when you need to make subtle granular changes to certain aspects: These APIs are the ones that are most likely to require [monkey-patching](https://davidwalsh.name/monkey-patching), but are also the least amenable to doing so in a concise and readable way.

# API

Patchinko exposes 3 functions that work together to make monkey-patching easier: `scope`, `patch` & `sp`:

* `scope` consumes a closure function: the closure function receives an entity you wish to patch, and should return the entity you want to replace it with. A noop scope would look like this: `scope(orginalThing => orginalThing)`
* `patch` is *essentially* like `Object.assign` - a noop would be: `patch(target, {})` - but when a property of the second argument is an instance of `scope`, then it executes it with target's property.
* `ps` is a composition of `patch` & `scope`, ie the equivalent of `extra => scope(originalThing => patch(originalThing, extra))`

# Example

[Thai Pangsakulyanont](http://dt.in.th) wrote [a great guide to common monkey-patching patterns for Javascript functions](http://me.dt.in.th/page/JavaScript-override/). Let's use patchinko to fulfill the examples he illustrated:

```js
import { patch as p, scope as s } from 'patchinko'

const test = p(new Test(), {
  // After decoration
  saveResults: s(function(original) {
    return function(filepath) {
      var returnValue = original.apply(this, arguments)
      var planpath = filepath.replace('.xml', '_plan.xml')
      console.log('Save test plan to ' + planpath)
      return returnValue
    }
  }),

  // Composition
  getName: s(function(original){
    return original.apply(this, arguments).toUpperCase()
  }),

  // Memoization
  fib: s(function(original){
    var memo = { }
    return function(x) {
      if (Object.prototype.hasOwnProperty.call(memo, x)) return memo[x]
      memo[x] = original.call(this, x)
      return memo[x]
    }
  })
})
```

Assuming you already have these pattern functions, the patching code looks like this:

```js
const test = p(new Test(), {
  // After
  saveResults: s(after(function(filepath) {
      var planpath = filepath.replace('.xml', '_plan.xml')
      console.log('Save test plan to ' + planpath)
    }
  })),

  // Composition
  getName: s(compose(function(name){
    return name.toUpperCase()
  })),

  // Memoization
  fib: s(memo)
})
```

The code above is only an improvement over Thai's simpler `override` function if you want to override many functions at once but don't have access to native [decorators](https://ponyfoo.com/articles/javascript-decorators-proposal). Thai's code is better because it's more transparent and involves significantly less magic.

# Erm so why

Patchinko is most useful when you need to significantly patch complex unwieldy objects, for example a verbose and inflexible legacy API like CKEDITOR. In these scenarios you may need to patch deep structures. The patchinko API, unlike `override`, allows declarative patching of recursive structures:

```js
p(thing, {
  simplePrimitive: 'simpleOverride',

  saveResults: s(after(function(filepath) {
      var planpath = filepath.replace('.xml', '_plan.xml')
      console.log('Save test plan to ' + planpath)
    }
  })),

  fibonacci: s(function(original){
    return p(original, {
      fib: s(memo)
    })
  }
})
```

In the example above, we patched `thing.simplePrimitive`, `thing.saveResults` & `thing.fibonacci.fib`, while leaving the rest of `thing` & `thing.fibonacci` intact. Patching `fibonacci` can be performed more tersely using `ps`, a composition of `patch` & `scope`:

```js
import {ps} from 'patchinko'

p(thing, {
  simplePrimitive: 'simpleOverride',

  saveResults: s(after(function(filepath) {
      var planpath = filepath.replace('.xml', '_plan.xml')
      console.log('Save test plan to ' + planpath)
    }
  })),

  fibonacci: ps({
    fib: s(memo)
  })
})
```

# Yuk!

Quite. The brevity of the full patchinko API pays dividends when the object you are patching is large & complex such that it's difficult enough to read without having to parse reams of interleaved structure, data, and patching logic - involved monkey-patching may be an undesirable last resort, but in circumstances where you are resigned to do it in the first place, streamlining the perfunctory patching logic is invaluable, such that the API code & the patches themselves shine through.

# I don't need this, I've got decorators

Forthcoming EcmaScript language features may eventually make Patchinko functionally redundant, but going by current trends this would involve a great deal of extra syntax, time & hope. In contrast, Patchinko is ES5 compatible (usable in Node and all major browsers at the time of writing), and involves nothing but functions, which can easily be traced. Patchinko is ultimately just functional convenience to abstract away the clunky imperative reference operations necessary to do something you could already do but at great cost to cognitive load & volume of code. From the functional perspective of patchinko, TC-39 decorators are unnecessarily ceremonious, ambiguous, magical & underpowered.
