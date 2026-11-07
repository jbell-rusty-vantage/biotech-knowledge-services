import { z } from "zod";

export const Slug = z.string().regex(/^[a-z0-9][a-z0-9._:-]{0,119}$/, "slug: ^[a-z0-9][a-z0-9._:-]{0,119}$");
export const Ref = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/, "ref: ^[a-z0-9][a-z0-9._-]{0,63}$");
export const Uid = z.string().regex(/^hu:[a-z0-9-]+:[A-Za-z0-9][A-Za-z0-9._\-/]*$/, "uid: hu:<token>:<opaque>");
export const Digest = z.string().regex(/^sha256:[0-9a-f]{64}$/, "digest: sha256:<hex>");
export const Timestamp = z.iso.datetime({ offset: true });
export const TypeName = z.string().regex(/^[A-Z][A-Za-z0-9]*$/, "GraphQL type name");
export const RelationshipType = z.string().regex(/^[A-Z][A-Z0-9_]*$/, "SCREAMING_SNAKE relationship type");
export const PropertyName = z.string().regex(/^[a-z][A-Za-z0-9]*$/, "camelCase property name");

export const Actor = z.strictObject({
  kind: z.enum(["agent", "human", "service"]),
  id: z.string().min(1).max(200),
  model: z.string().max(200).optional(),
});
export type Actor = z.infer<typeof Actor>;

/** Mission Control run identity. `runId` is the external run id the Activity node records as `externalRunId`. */
export const RunContext = z.strictObject({
  system: z.string().min(1).max(60).default("mission-control"),
  runId: z.string().min(1).max(200),
  missionId: z.string().max(200).optional(),
  activationId: z.string().max(200).optional(),
  attempt: z.number().int().nonnegative().optional(),
});
export type RunContext = z.infer<typeof RunContext>;

export const JsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonValue), z.record(z.string(), JsonValue)]),
);
export const PropertyMap = z.record(PropertyName, JsonValue);
export type PropertyMap = z.infer<typeof PropertyMap>;

export const TimePrecision = z.enum(["INSTANT", "DAY", "MONTH", "QUARTER", "YEAR", "DECADE"]);
export const ValidTimeBasis = z.enum(["STATED_BY_SOURCE", "PUBLICATION_PROXY", "OBSERVATION_ONLY", "INFERRED", "UNKNOWN"]);

/** Bitemporal validity declared by the author (valid time only; recorded time is service-assigned). */
export const Validity = z.strictObject({
  validFrom: Timestamp.nullable().optional(),
  validTo: Timestamp.nullable().optional(),
  validFromPrecision: TimePrecision.optional(),
  validToPrecision: TimePrecision.optional(),
  validFromBasis: ValidTimeBasis.optional(),
  validToBasis: ValidTimeBasis.optional(),
  statedAsOf: Timestamp.optional(),
  statedAsOfPrecision: TimePrecision.optional(),
});
export type Validity = z.infer<typeof Validity>;
