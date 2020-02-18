import { assert, IsExact, IsNever } from "conditional-type-checks";
import { ToPatchRequest } from 'patchinko';
import { Target, InnerTarget } from "./targets";

type T = ToPatchRequest<InnerTarget>;

// InnerTarget should be coercible to patch requests.
assert<IsExact<ToPatchRequest<InnerTarget>, InnerTarget>>(true);

// Target should be coercible to patch requests.
assert<IsExact<ToPatchRequest<Target>, Target>>(true);

// Primitives cannot be coerced to patch requests.
assert<IsNever<ToPatchRequest<string>>>(true);
assert<IsNever<ToPatchRequest<number>>>(true);
assert<IsNever<ToPatchRequest<symbol>>>(true);
assert<IsNever<ToPatchRequest<null>>>(true);
assert<IsNever<ToPatchRequest<undefined>>>(true);
assert<IsNever<ToPatchRequest<bigint>>>(true);
