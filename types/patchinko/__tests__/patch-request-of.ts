import { assert, IsNever, NotHas, Has } from "conditional-type-checks";
import { PatchRequestOf, PSInstruction, DInstruction } from 'patchinko';
import { Target, InnerTarget } from "./targets";

interface Original {
    t: {
        c: InnerTarget
    };
}

interface RequestWithOrphanedInstruction {
    t: {
        // Cannot patch `c` because its container `t` is a substitution.
        c: PSInstruction<InnerTarget>
    };
}

// RequestWithOrphanedInstruction should not extend patch request.
assert<NotHas<RequestWithOrphanedInstruction, PatchRequestOf<Original>>>(true);

// A p patch request of InnerTarget should contain InnerTarget.
assert<Has<InnerTarget, PatchRequestOf<InnerTarget>>>(true);

// A p patch request of Target should contain Target.
assert<Has<Target, PatchRequestOf<Target>>>(true);

// Patch requests of primitives should result in never.
assert<IsNever<PatchRequestOf<string>>>(true);
assert<IsNever<PatchRequestOf<number>>>(true);
assert<IsNever<PatchRequestOf<symbol>>>(true);
assert<IsNever<PatchRequestOf<null>>>(true);
assert<IsNever<PatchRequestOf<undefined>>>(true);
assert<IsNever<PatchRequestOf<bigint>>>(true);

interface OptionalTarget {
    target?: Target;
}

interface DeleteRequest {
    target: DInstruction<Target>;
}

// DeleteRequest should extend patch request of OptionalTarget.
assert<Has<DeleteRequest, PatchRequestOf<OptionalTarget>>>(true);
