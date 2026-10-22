// Types for schema.mjs, so the deck's TypeScript can import the same validator the scripts use.

export type LoadedSchema = {
  root: unknown;
  file: string;
  read: (file: string) => unknown;
};

export function loadSchema(file: string): LoadedSchema;
export function validate(loaded: LoadedSchema, value: unknown): string[];
export function capStrings<T>(loaded: LoadedSchema, value: T): T;
