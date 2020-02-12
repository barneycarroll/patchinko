import { assert, IsNever, IsExact } from "conditional-type-checks";
import { PSInstruction, WholesomeReplacement, DInstruction, Overloaded } from "patchinko";
import { Target, InnerTarget } from "./targets";

interface NestedPSInstruction {
  b: PSInstruction<Target>;
}

assert<IsExact<WholesomeReplacement<string>, string>>(true);
assert<IsExact<WholesomeReplacement<InnerTarget>, InnerTarget>>(true);
assert<IsExact<WholesomeReplacement<Target>, Target>>(true);
assert<IsNever<WholesomeReplacement<PSInstruction<Target>>>>(true);
assert<IsNever<WholesomeReplacement<NestedPSInstruction>>>(true);
assert<IsNever<WholesomeReplacement<{ a: NestedPSInstruction }>>>(true);
assert<IsNever<WholesomeReplacement<{ a: DInstruction<undefined> }>>>(true);
assert<IsNever<WholesomeReplacement<{ a: Overloaded }>>>(true);
