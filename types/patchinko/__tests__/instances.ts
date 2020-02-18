import { P, PS } from 'patchinko';
import { assert, IsExact } from 'conditional-type-checks';
import { Target } from './targets';

// Handling of instances from arbitrary classes

interface WithSet {
    a: Set<Target>;
}

interface WithArray {
    b: Target[];
}

declare const withSet: WithSet;
declare const withArray: WithArray;

const test1 = P(withSet, { a: new Set<Target>() });
assert<IsExact<WithSet, typeof test1>>(true);

// Monkey patching
const test2 = P(withSet, { a: PS({ clear: () => {} })});
assert<IsExact<WithSet, typeof test2>>(true);

const test3 = P(withArray, { b: [] });
assert<IsExact<WithArray, typeof test3>>(true);
