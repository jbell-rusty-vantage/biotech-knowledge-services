import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Generated from the PRINTED EXECUTABLE schema (apps/graphql-api/generated/schema.graphql, produced by the server's
 * own builder) and the reviewed safelisted documents; never from the source SDL.
 */
const config: CodegenConfig = {
  overwrite: true,
  schema: "../../apps/graphql-api/generated/schema.graphql",
  documents: ["../../apps/graphql-api/operations/documents/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "src/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
        gqlTagName: "graphql",
        persistedDocuments: { mode: "replaceDocumentWithHash", hashAlgorithm: "sha256", hashPropertyName: "hash" },
      },
      config: {
        documentMode: "string",
        strictScalars: true,
        scalars: { DateTime: "string", Date: "string", ID: "string" },
        enumsAsTypes: true,
        useTypeImports: true,
        emitLegacyCommonJSImports: false,
        dedupeFragments: true,
        skipTypename: false,
        nonOptionalTypename: false,
      },
    },
  },
};

export default config;
