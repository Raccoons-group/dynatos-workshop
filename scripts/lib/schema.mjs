// A small JSON Schema validator for the live deck's own schemas, so the scripts need no dependencies.
// It covers the subset those schemas use: type, enum, const, properties, required, additionalProperties,
// items, maxItems, maxLength, minimum, pattern, oneOf, and $ref (local "#/$defs/…" or a sibling file).

import fs from "node:fs";
import path from "node:path";

export function loadSchema(file) {
  const cache = new Map();
  const read = (absolute) => {
    if (!cache.has(absolute))
      cache.set(absolute, JSON.parse(fs.readFileSync(absolute, "utf8")));
    return cache.get(absolute);
  };
  const rootFile = path.resolve(file);
  return { root: read(rootFile), file: rootFile, read };
}

function resolve(ctx, schema) {
  let { file } = ctx;
  while (schema && schema.$ref) {
    const [target, pointer = ""] = schema.$ref.split("#");
    if (target) file = path.resolve(path.dirname(file), target);
    let resolved = ctx.read(file);
    for (const key of pointer.split("/").filter(Boolean))
      resolved = resolved[key];
    if (!resolved)
      throw new Error(`Unresolvable $ref ${schema.$ref} in ${ctx.file}`);
    schema = resolved;
  }
  return { schema, ctx: { ...ctx, file } };
}

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function typeMatches(expected, value) {
  const actual = typeOf(value);
  const types = Array.isArray(expected) ? expected : [expected];
  return types.some(
    (type) => type === actual || (type === "number" && actual === "integer"),
  );
}

function check(ctx, rawSchema, value, at, errors) {
  const { schema, ctx: here } = resolve(ctx, rawSchema);
  const where = at || "/";

  if (schema.oneOf) {
    const passing = schema.oneOf.filter((option) => {
      const optionErrors = [];
      check(here, option, value, at, optionErrors);
      return optionErrors.length === 0;
    });
    if (passing.length !== 1)
      errors.push(`${where}: must match exactly one allowed shape`);
    return;
  }
  if (schema.type && !typeMatches(schema.type, value)) {
    errors.push(
      `${where}: must be ${[].concat(schema.type).join(" or ")}, got ${typeOf(value)}`,
    );
    return;
  }
  if ("const" in schema && value !== schema.const)
    errors.push(`${where}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(
      `${where}: must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`,
    );
  }

  if (typeof value === "string") {
    if (
      schema.maxLength !== undefined &&
      [...value].length > schema.maxLength
    ) {
      errors.push(`${where}: longer than ${schema.maxLength} characters`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value))
      errors.push(`${where}: doesn't match ${schema.pattern}`);
  }
  if (
    typeof value === "number" &&
    schema.minimum !== undefined &&
    value < schema.minimum
  ) {
    errors.push(`${where}: must be at least ${schema.minimum}`);
  }

  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      errors.push(`${where}: more than ${schema.maxItems} items`);
    if (schema.items)
      value.forEach((item, i) =>
        check(here, schema.items, item, `${at}/${i}`, errors),
      );
  }

  if (typeOf(value) === "object") {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${at}/${key}: is required`);
    }
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties && key in schema.properties)
        check(here, schema.properties[key], child, `${at}/${key}`, errors);
      else if (schema.additionalProperties === false)
        errors.push(`${at}/${key}: isn't allowed`);
    }
  }
}

export function validate(loaded, value) {
  const errors = [];
  check(loaded, loaded.root, value, "", errors);
  return errors;
}

// Returns a copy of `value` with every string longer than its schema's maxLength cut to fit, ending in "…".
export function capStrings(loaded, value) {
  const walk = (ctx, rawSchema, current) => {
    const { schema, ctx: here } = resolve(ctx, rawSchema);
    if (schema.oneOf) {
      const fitting = schema.oneOf.find((option) => {
        const { schema: s } = resolve(here, option);
        return !s.type || typeMatches(s.type, current);
      });
      return fitting ? walk(here, fitting, current) : current;
    }
    if (typeof current === "string" && schema.maxLength !== undefined) {
      const chars = [...current];
      return chars.length > schema.maxLength
        ? chars.slice(0, schema.maxLength - 1).join("") + "…"
        : current;
    }
    if (Array.isArray(current))
      return schema.items
        ? current.map((item) => walk(here, schema.items, item))
        : current;
    if (typeOf(current) === "object") {
      return Object.fromEntries(
        Object.entries(current).map(([key, child]) => [
          key,
          schema.properties?.[key]
            ? walk(here, schema.properties[key], child)
            : child,
        ]),
      );
    }
    return current;
  };
  return walk(loaded, loaded.root, value);
}
