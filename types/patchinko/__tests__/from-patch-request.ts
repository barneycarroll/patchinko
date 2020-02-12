import { assert, IsExact, IsNever } from "conditional-type-checks";
import { PSInstruction, FromPatchRequest, DInstruction, SInstruction } from 'patchinko';
import { Target, InnerTarget } from "./targets";

interface DeepType {
    a: {
        b: Target
    };
}

interface DeeplyNestedInstructions {
    a: PSInstruction<{
        b: PSInstruction<Target>;
    }>;
}

interface BaseType {
    a: Target;
}

interface WithDeleteInstructions {
    a: DInstruction<Target>;
}

interface WithScopeInstructions {
    a: SInstruction<Target>;
}

interface WithOrphanedInstructions {
    t: {
        // Cannot patch `c` because its container `t` is a substitution.
        c: PSInstruction<InnerTarget>
    };
}

// WithOrphanedInstruction should not be candidate for extraction.
assert<IsNever<FromPatchRequest<WithOrphanedInstructions>>>(true);

// Extracting from WithDeleteInstructions should result in BaseType.
assert<IsExact<BaseType, FromPatchRequest<WithDeleteInstructions>>>(true);

// Extracting from WithScopeInstructions should result in BaseType.
assert<IsExact<BaseType, FromPatchRequest<WithScopeInstructions>>>(true);

// Extracting from DeeplyNestedInstructions should result in DeepType.
assert<IsExact<DeepType, FromPatchRequest<DeeplyNestedInstructions>>>(true);
