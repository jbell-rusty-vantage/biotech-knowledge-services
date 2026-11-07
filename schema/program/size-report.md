# Executable schema size report

Printed schema: `runs/executable-schema.graphql` · SDL digest `sha256:8313a6f83a2429fffdc9ce6cbdb03cc2808c7b06022040a1e4f36cd2720ae3eb`.

## Headline

| measure | value |
| --- | ---: |
| printed size | 55.2 MB |
| printed lines | 693,831 |
| input types | 38,034 |
| object types | 6,344 |
| enums | 196 |
| Query fields | 476 |
| Mutation fields | 530 |
| SDL node types | 192 |
| SDL relationship fields | 1082 |
| SDL from→to pairs | 3940 |
| input types per SDL pair | 9.7 |

## Input types by family

| family | input types | lines |
| --- | ---: | ---: |
| NodeAggregationWhereInput | 992 | 259,039 |
| Where | 324 | 73,104 |
| ConnectionWhere | 4,377 | 31,266 |
| ConnectionFilters | 1,085 | 27,741 |
| AggregateInput | 1,984 | 20,304 |
| ConnectFieldInput | 4,284 | 19,154 |
| DeleteFieldInput | 4,284 | 17,073 |
| DisconnectFieldInput | 4,284 | 17,073 |
| UpdateFieldInput | 2,341 | 16,387 |
| FieldInput | 4,057 | 16,228 |
| CreateFieldInput | 4,057 | 14,037 |
| UpdateConnectionInput | 2,341 | 11,198 |
| UpdateInput | 298 | 10,952 |
| CreateInput | 324 | 8,615 |
| Sort | 284 | 5,196 |
| DeleteInput | 282 | 4,941 |
| ConnectInput | 277 | 4,909 |
| DisconnectInput | 277 | 4,909 |
| AggregationWhereInput | 43 | 4,618 |
| RelationshipFilters | 220 | 3,916 |
| ConnectionSort | 1,055 | 3,892 |
| EnumScalarFilters | 188 | 752 |
| ConnectWhere | 189 | 567 |
| EnumScalarMutations | 159 | 487 |
| Filters | 14 | 82 |
| Mutations | 10 | 42 |
| OnCreateInput | 3 | 28 |
| other | 1 | 4 |

## Generated lines attributed to the declaring SDL node type (top 40)

A generated type is attributed to the SDL node type whose name prefixes it; `(shared)` collects kernel scalars, enums and interface/union families.

| node type | generated types | generated lines | SDL relationship fields | widest target |
| --- | ---: | ---: | ---: | --- |
| Organization | 1,155 | 24,912 | 59 | SponsorableTarget (5) |
| Assertion | 2,056 | 17,487 | 17 | AssertionSubjectTarget (144) |
| Chunk | 2,455 | 17,203 | 9 | AssertionSubjectTarget (144) |
| ClaimOccurrence | 2,066 | 16,404 | 16 | AssertionSubjectTarget (144) |
| (shared) | 1,197 | 16,365 |  |  |
| InteractionAssertion | 1,898 | 12,691 | 9 | AssertionSubjectTarget (144) |
| RelationshipAssertion | 1,902 | 12,682 | 9 | AssertionSubjectTarget (144) |
| ContraindicationAssertion | 1,898 | 12,672 | 9 | AssertionSubjectTarget (144) |
| Activity | 407 | 11,592 | 23 | — |
| MediaAsset | 1,418 | 11,392 | 11 | MediaSubjectTarget (75) |
| Document | 1,351 | 10,939 | 10 | AssertionSubjectTarget (144) |
| ResolutionHypothesis | 1,311 | 10,025 | 9 | AssertionSubjectTarget (144) |
| Person | 438 | 9,925 | 22 | RecommendableTarget (10) |
| Event | 469 | 8,240 | 17 | EventSubjectTarget (15) |
| Product | 326 | 7,923 | 21 | EquipmentModelTarget (2) |
| SourceLocator | 652 | 7,456 | 11 | SupportedRecordTarget (29) |
| Identifier | 1,182 | 7,272 | 1 | AssertionSubjectTarget (144) |
| TradeItemIdentifier | 1,176 | 7,001 | 1 | AssertionSubjectTarget (144) |
| EquivalenceAssessment | 972 | 6,855 | 6 | AssertionSubjectTarget (144) |
| EvidenceSynthesis | 237 | 6,499 | 14 | SynthesisInputTarget (2) |
| EvidenceApplicability | 275 | 6,120 | 14 | ApplicabilityUseTarget (8) |
| Study | 284 | 5,934 | 15 | LegacyEvaluatedIntervention (9) |
| ProtocolEdition | 242 | 5,861 | 11 | TherapeuticTargetTarget (3) |
| Observation | 217 | 5,851 | 13 | — |
| ProductVariant | 231 | 5,741 | 12 | — |
| IngredientMaterial | 294 | 5,577 | 14 | MaterialContentTarget (3) |
| MediaAnnotation | 675 | 5,571 | 4 | MediaSubjectTarget (75) |
| SafetySignal | 277 | 5,565 | 11 | SafetySubjectTarget (8) |
| Treatment | 264 | 5,467 | 9 | TreatmentComponentTarget (9) |
| MediaSuitabilityAssessment | 692 | 5,460 | 5 | MediaSubjectTarget (75) |
| FigurePanel | 713 | 5,359 | 5 | MediaSubjectTarget (75) |
| Biomarker | 211 | 5,320 | 12 | — |
| ChemicalSubstance | 226 | 5,268 | 12 | — |
| MerchantListing | 219 | 5,161 | 11 | ListingTarget (3) |
| Offer | 192 | 5,026 | 10 | — |
| Episode | 246 | 4,822 | 12 | EpisodeMentionableTarget (9) |
| ClaimEvidenceAssessment | 180 | 4,570 | 9 | — |
| Condition | 186 | 4,481 | 10 | — |
| AssayVersion | 220 | 4,458 | 11 | EquipmentModelTarget (2) |
| Adjudication | 171 | 4,371 | 9 | EvidenceAssessmentArchetype (20) |

## Largest generated types (top 25)

| type | kind | lines |
| --- | --- | ---: |
| OrganizationWhere | input | 2,623 |
| ActivityWhere | input | 1,067 |
| ProductWhere | input | 1,063 |
| AssertionWhere | input | 956 |
| PersonWhere | input | 931 |
| ClaimOccurrenceWhere | input | 915 |
| EventWhere | input | 821 |
| EvidenceSynthesisWhere | input | 733 |
| EvidenceApplicabilityWhere | input | 731 |
| StudyWhere | input | 714 |
| ProtocolEditionWhere | input | 706 |
| IngredientMaterialWhere | input | 692 |
| ObservationWhere | input | 680 |
| MerchantListingWhere | input | 670 |
| SourceLocatorWhere | input | 662 |
| SafetySignalWhere | input | 657 |
| MediaAssetWhere | input | 652 |
| ChemicalSubstanceWhere | input | 647 |
| ContraindicationAssertionWhere | input | 641 |
| InteractionAssertionWhere | input | 637 |
| RelationshipAssertionWhere | input | 622 |
| BiomarkerWhere | input | 621 |
| EpisodeWhere | input | 608 |
| ProductVariantWhere | input | 607 |
| ProtocolAdjustmentRuleModifiesStepsNodeAggregationWhereInput | input | 603 |

