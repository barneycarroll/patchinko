import { immutable as O } from "patchinko";

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
O(x, { foo: O });

// Correct
// $ExpectType X
O(x, { foo: O({ bar: O }) });

// Correct
// $ExpectType X
O(x, { foo: O({ oop: O, bar: { bish: "bash" } }) });

// Correct, not all properties are required as a O patch argument.
// $ExpectType X
O(x, { foo: O({ oop: O }) });

// Correct
// $ExpectType X
O(x, { foo: O({ bar: O({ bish: "bash" }) }) });

// Also correct - but `bar` will not be patched - instead it will be replaced.
// $ExpectType X
O(x, { foo: O({ bar: { bish: "bash" } }) });

// Correct usage of O
// $ExpectType X
O(x, { foo: O((old: X['foo']) => ({ bar: { bish: (old && old.bar.bish || '') + 'bash' } }))});

// Correct usage of O nested in a O call
// $ExpectType X
O(x, { foo: O({ bar: O(() => ({ bish: 'oops' })) }) });

// Incorrect - we can't patch `bar` because its container - `foo` is a wholesale replacement:
// $ExpectError
O(x, O({ foo: { bar: O({ bish: "bash" }) } }));

// Incorrect - primitive values cannot be patched
// $ExpectError
O(x, { foo: O({ bar: O({ bish: O("bash") }) }) });

// Incorrect - wrapping is only necessary for child structures - patch arguments will always patch, not replace
// $ExpectError
O(x, O({ foo: O({ bar: O({ bish: "bash" }) }) }));

// Incorrect, O cannot be called with no argument
// $ExpectError
O(x, { foo: O() });

// Incorrect usage of O nested in a O patch
// $ExpectError
O(x, { foo: O(() => ({ bar: O })) });
