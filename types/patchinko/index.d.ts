// Project: https://github.com/barneycarroll/patchinko
// Version: patchinko@4.2.0
// Definitions by: Jules Sam. Randolph <https://github.com/jsamr>
// TypeScript Version: 3.5

declare module "patchinko" {
  // Symbols for unique proxies
  const PSSymbol: unique symbol;
  const SSymbol: unique symbol;
  const DSymbol: unique symbol;
  type InstructionSymbol = typeof PSSymbol | typeof SSymbol | typeof DSymbol;
  // Utility types
  type IsAny<T> = 0 extends 1 & T ? true : false;
  type IsNever<T> = [T] extends [never] ? true : false;
  type Atom<T> = T extends InstructionSymbol
    ? never
    : T extends number | string | boolean | symbol | null | undefined | bigint
    ? T
    : T extends DInstruction<any>
    ? never
    : T extends (...args: any[]) => any
    ? T
    : never;

  type HasNeverProps<T, R = Required<T>> = {
    [K in keyof R]: IsAny<R[K]> extends true
      ? false
      : IsNever<R[K]> extends true
      ? true
      : false;
  }[keyof R] extends false
    ? false
    : true;

  type NeverAscend<T> = HasNeverProps<T> extends true ? never : T;

  type NonInstructionDict<T> = NeverAscend<
    {
      [K in keyof T]: K extends InstructionSymbol
        ? never
        : T[K] extends Atom<T[K]>
        ? T[K]
        : NonInstructionDict<T[K]>;
    }
  >;

  type WholesomeReplacement<T> = T extends Atom<T> | NonInstructionDict<T> | any[]
    ? T
    : never;

  // Instructions
  type PSInstruction<T> = T extends never
    ? never
    : T extends PSTargetObject<T>
    ? {
        [PSSymbol]: Partial<T>;
      }
    : never;

  type DInstruction<T> = T extends never
    ? never
    : {
        [DSymbol]: T;
      };

  type SInstruction<T> = T extends never
    ? never
    : T extends WholesomeReplacement<T>
    ? {
        [SSymbol]: T;
      }
    : never;

  type PSTargetObject<T> = T extends object
    ? NeverAscend<
        {
          [K in keyof T]?: T[K] extends
            | PSInstruction<any>
            | DInstruction<any>
            | SInstruction<any>
            ? T[K]
            : WholesomeReplacement<T[K]>;
        }
      >
    : never;

  // Coerce T to a patch request
  type ToPatchRequest<T> = T extends Atom<T>
    ? never
    : T extends object
    ? T extends PSTargetObject<T>
      ? T
      : never
    : T;

  type ExtractTargetFromRequest<T> = T extends Atom<T>
    ? T
    : T extends object
    ? {
        [K in keyof T]: T[K] extends PSInstruction<infer U>
          ? ExtractTargetFromRequest<U>
          : T[K] extends DInstruction<infer U>
          ? ExtractTargetFromRequest<U>
          : T[K] extends SInstruction<infer U>
          ? ExtractTargetFromRequest<U>
          : T[K];
      }
    : never;

  // Extract the type of which T is a patch request.
  type FromPatchRequest<T> = NeverAscend<
    ExtractTargetFromRequest<ToPatchRequest<T>>
  >;

  // The set of types which are patch requests of T.
  type PatchRequestOf<T> = T extends Atom<T>
    ? never
    : T extends object
    ? NeverAscend<
        {
          [K in keyof T]?:
            | PSInstruction<T[K]>
            | DInstruction<T[K]>
            | SInstruction<T[K]>
            | WholesomeReplacement<T[K]>;
        }
      >
    : T;

  type SPatchFunction<T> = T extends WholesomeReplacement<T>
    ? (target: T) => T
    : never;

  interface PS {
    <T>(p: ToPatchRequest<T>): PSInstruction<FromPatchRequest<T>>;
    <T>(target: object, p: ToPatchRequest<T>): PSInstruction<FromPatchRequest<T>>;
  }

  interface P {
    <T>(
      target: T,
      request: PatchRequestOf<T>,
      ...requests: Array<PatchRequestOf<T>>
    ): T;
  }
  interface S {
    <T>(scoped: SPatchFunction<T>): SInstruction<T>;
  }

  interface Overloaded extends /* D */ DInstruction<undefined> {
    /* PS */ <T>(p: ToPatchRequest<T>): PSInstruction<FromPatchRequest<T>>;
    /* S  */ <M>(closure: SPatchFunction<M>): SInstruction<M>;
    /* P  */ <T>(target: T, request: PatchRequestOf<T>): T;
  }
  const immutable: Overloaded;
  const constant: Overloaded;
  const PS: PS;
  const P: P;
  const D: DInstruction<undefined>;
  const S: S;
}

declare module "patchinko/immutable" {
  import { immutable } from "patchinko";
  export = immutable;
}

declare module "patchinko/constant" {
  import { constant } from "patchinko";
  export = constant;
}

declare module "patchinko/explicit" {
  export { P, PS, D, S } from "patchinko";
}
