import { NeverAscend } from "patchinko";
import { assert, IsNever } from "conditional-type-checks";

assert<IsNever<NeverAscend<{}>>>(false);
assert<IsNever<NeverAscend<{ a: never }>>>(true);
assert<IsNever<NeverAscend<{ a: never; b: string }>>>(true);
assert<IsNever<NeverAscend<{ a: number; b: string }>>>(false);
assert<IsNever<NeverAscend<{ a: any }>>>(false);
assert<IsNever<NeverAscend<{ a: unknown }>>>(false);
assert<IsNever<NeverAscend<{ a: undefined }>>>(false);
assert<IsNever<NeverAscend<{ a: string }>>>(false);
assert<IsNever<NeverAscend<{ a?: string }>>>(false);
assert<IsNever<NeverAscend<{ a?: never }>>>(true);
