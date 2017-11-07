# Patchinko [![Build Status](https://travis-ci.org/barneycarroll/patchinko.svg?branch=master)](https://travis-ci.org/barneycarroll/patchinko)

Patchinko is a little utility for terse & subtle object mutation (or copying). It takes its name from *patching* (as in [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch)) & *[patchinko](https://en.wikipedia.org/wiki/Pachinko)*, a Japanese game with minimal interface that rewards attentiveness <sup>[1](#user-content-f-romanisation)<a name=s-romanisation></a></sup>.

Patchinko doesn't aim to promote patterns for high level application programming concerns: it's a low level tool that makes object modification easier to write & read.

It is written in ES3 and eschews exotic & ceremonious operations for greater clarity & confidence <sup>[2](#user-content-f-exotic)<a name=s-exotic></a></sup>.

***

# Why 

Patchinko was written to overcome the frustration of modifying complex structures in written idioms that emphasise the method by which change is made over the change itself. Patchinko aims for a minimal ratio of operand to operator in application code so that you can focus on the what instead of the how.

# How

Patchinko consists of 4 methods.

## p(target, ...patches)

`p` behaves identically to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign), except when properties on `patch` objects are of the special types listed below:

## s(function scope(definition){})

`s` consumes a 'scope function' and returns a special type that, when encountered as a patch property in a `p` operation, will execute the scope function, supplying the property of the same key from the target as the definition argument, and replace it with the return value*.

## d

When encountered as a patch property in a `p` operation, [deletes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete) the property of the same key on the target.

## ps(patch)

When encountered as a patch property in a `p` operation, patches the property of the same key on the target with patch. Short-hand for `s(definition => p(definition, patch))`.

## ps(target, ...patches)

As above, except the original definition is supplied to the underlying `p` invocation as the *2nd argument* - not the first. Equivalent to `s(definition => p(target, definition, ...patches))`. Necessary for immutable deep object patch operations.

# What

## Purity / immutable operations

Patchinko was originally with the express goal of mutating persistent objects to modify behaviour invoked elsewhere, but is perfectly suited to immutable object transformation. In order to avoid mutating targets, simply provide a new object instance as the 1st argument in `p` and `ps` invocations.

## Patching 

This tool was originally written to monkey patch a complex & unwieldy third party API written in consummate early 00s AOP style. The API in question used a mixture of overlapping config-based interfaces and instruction methods with many internal esoteric object types and an ambiguous nested OOP plugin architecture. These APIs are difficult enough to read and use on their own terms without the added precarity of Javascript's large and confusing panoply of methods for modifying objects and decorating functions. When monkey-patching is a necessity, Patchinko gives you a tiny yet comprehensive API for all conceivable concerns such that you can stop worrying about how monkey-patching & decorating works and how you should write your patch, allowing you to focus instead on the API you're patching & the patch itself.

In this simple example, an object is patched to modify a static property and decorate a method. In this case, the decoration provides logs of current state & invocation arguments before executing the decorated method as it normally would be.

It's difficult to demonstrate a realistic example of useful Patchinko patching without reference to an esoteric API and a recondite problem case: Patchinko's elegance emerges from the clarity of being able to focus on several patching operations in a declarative construct, but making sense of multiple operations in the same construct depends on an understanding of the structure and intent of a target and patches relating to domain specific concerns: Patchinko itself aims to be as small, generic and transparent as possible so that complex domain specific concerns shine through in written code. Moreover, this is not a common or desirable problem: the cognitive burden of monkey-patching & decorating a complex object is significant. The fact it is rarely mentioned, and then most often with a strong warning not to do so is a testament to the fact that: it usually indicates a deeper problem (is the underlying target API the right choice, if it requires custom hacks to operate the way you want it to?), and also speaks to the extra cognitive burden of figuring out what methods are safest / necessary / most appropriate to apply such hacks in Javascript. Patchinko solves the latter problem in a way that obviates code style paralysis but makes no claim to the former.

## Guide

Given the paradox of meaningful illustrations of holistic patching concerns, we can still illustrate how discrete types of patching intent are performed, with an understanding that Patchinko becomes increasingly useful as many such operations are combined recursively.

These examples are written in a way that takes full advantage of modern ECMAScript for expressive purposes, but Patchinko itself is written in pure ECMAScript 3 and will work out of the box in any Javascript environment, whether that be Internet Explorer 6 or an old Rhino build.

These examples are divided into 2 discrete areas. The first concerns data structures, which illustrates changes to 'plain' data objects; the second concerns decoration, which involves recondite uses of s to shadow functions, and merits a more involved documentation on its own terms. If you're only concerned with state management, you probably only need the first. If you're embarking for nightmare-mode monkey-patching hell levels you'll likely need both, and reference to the second is probably more pertinent.

### Data structures 

#### Static object mutation

In this example we want to change a couple of properties of a data structure representing state.

### Decoration 

...

***

1. <a name=f-romanisation></a> Who's to say *パチンコ* can't be romanised *patchinko*? [It's good enough for Mano Negra](https://en.wikipedia.org/wiki/In_the_Hell_of_Patchinko), who are good enough for me [🔙](#user-content-s-romanisation).

2. <a name=f-exotic></a> Patchinko stands in contrast to the unwieldly structures created & consumed by eg. lenses, reducers (in the sense of Redux), etc, which rely on highly formalised application code boilerplate to change or transform objects. Arguably, there is a value proposition in many patterns like React's `setState` etc whereby changes to data structures are cumbersome enough that the author is disuaded from the effort of using them when they might not need to, and for anybody reading the code the fact that data is being modified is made more prominent than the modification itself. In this way these constructs perpetuate the idea that data transformation is necessarily burdensome. Patchinko accepts the original premise but aims to solve it rather than reinforce it. [🔙](#user-content-s-exotic)