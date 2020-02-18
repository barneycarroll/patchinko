import { PSInstruction } from "patchinko";

export interface InnerTarget {
    a: string;
}

export interface Target {
    a: string;
    b: number;
    c: InnerTarget;
}

export interface DeeplyNestedTarget {
    a: {
        b: {
            c: Target
        }
    };
}

export interface DeeplyNestedRequest {
    a: PSInstruction<{
        b: PSInstruction<{
            c: PSInstruction<Target>
        }>
    }>;
}
