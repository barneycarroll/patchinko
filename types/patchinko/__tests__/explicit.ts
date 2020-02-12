import { P, PS, D, S } from "patchinko";

// Integration tests

interface Bar {
  bish: string;
}

interface X {
  foo?: {
    bar: Bar;
    oop?: string
  };
  z: string;
}

const x: X = {
  foo: { bar: { bish: "bish" } },
  z: 'zoo'
};

// Correct
// $ExpectType X
P(x, { foo: D });

// Correct
// $ExpectType X
P(x, { foo: PS({ bar: D }) });

// Correct
// $ExpectType X
P(x, { foo: PS({ oop: D, bar: { bish: "bash" } }) });

// Correct, not all properties are required as a PS patch argument.
// $ExpectType X
P(x, { foo: PS({ oop: D }) });

// Incorrect, we are adding an unknown property to X['foo'].
// $ExpectError
P(x, { foo: PS({ tada: "" }) });

// Correct
// $ExpectType X
P(x, { foo: PS({ bar: PS({ bish: "bash" }) }) });

// Also correct - but `bar` will not be patched - instead it will be replaced.
// $ExpectType X
P(x, { foo: PS({ bar: { bish: "bash" } }) });

// Correct usage of S
// $ExpectType X
P(x, { foo: S((old: X['foo']) => ({ bar: { bish: (old && old.bar.bish || '') + 'bash' } }))});

// Correct usage of S nested in a PS call
// $ExpectType X
P(x, { foo: PS({ bar: S(() => ({ bish: 'oops' })) }) });

// Incorrect - we can't patch `bar` because its container - `foo` is a wholesale replacement:
// $ExpectError
P(x, PS({ foo: { bar: PS({ bish: "bash" }) } }));

// Incorrect - primitive values cannot be patched
// $ExpectError
P(x, { foo: PS({ bar: PS({ bish: PS("bash") }) }) });

// Incorrect - wrapping is only necessary for child structures - patch arguments will always patch, not replace
// $ExpectError
P(x, PS({ foo: PS({ bar: PS({ bish: "bash" }) }) }));

// Incorrect, D must not be called
// $ExpectError
P(x, { foo: D() });

// Incorrect usage of D nested in a S patch
// $ExpectError
P(x, { foo: S(() => ({ bar: D })) });

// Correct usage of PS second signature
// $ExpectType X
P(x, { foo: PS({}, { bar: { bish: "bash" }}) });

// Incorrect, we are adding an unknown property to X['foo'].
// $ExpectError
P(x, { foo: PS({}, { tada: 'bah' }) });
