## 3. Object Craft: Form, Material & Continuity Across 3 Scales

Adding more scattered objects never fixes weak modeling of the primary subject. Craft must be resolved across three distinct visual scales:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE 3 SCALES OF OBJECT CRAFT                    │
├───────────────────┬────────────────────────────┬───────────────────────┤
│    SILHOUETTE     │        CONSTRUCTION        │        SURFACE        │
│ Proportions & Mass│   Thickness, Joints, Joins │ Texture Grain & Seams │
│ (Readable in B&W) │  (Mechanical / Biological) │   (Viewing Scale Only)│
└───────────────────┴────────────────────────────┴───────────────────────┘
```

### Scale 1: Silhouette (The Outline Test)
- **Rule**: An object must be immediately recognizable by its silhouette alone without relying on surface color or lighting.
- A windmill, inn, and observatory must remain distinguishable in pure black-and-white. Distinct creature species require distinct anatomical skeletal proportions, not recolored copies of the same base mesh.
- Model silhouette-changing features as **actual geometry**, not normal maps or bump textures.

### Scale 2: Construction & Join Continuity
When attached volumes look like unrelated lumps, diagnose the join relationship:

| Observed Weakness | Root Cause | Sovereign Intervention |
| :--- | :--- | :--- |
| **Accidental seams or bulging seams** | Separate meshes intersecting clumsily on what should be one organic skin. | Author shared continuous surface loops, bridge boundary edges, or perform selective remeshing/CSG union. |
| **Pinching or faceted highlights** | Non-uniform vertex normals, bad winding, or excessive triangulation at joints. | Inspect vertex normals, local curvature, and topology loops before adding polygons. |
| **Disconnected floating layers** | Armor plates, roof tiles, or feathers floating without roots or overlap order. | Refine overlap sequence, root anchorage, thickness, and realistic spacing. |
| **Redundant internal geometry** | Meshes joined without deleting internal hidden polygons, wasting GPU vertex budgets. | Purge hidden internal faces unless revealed by dynamic cutaways or animation. |

> ⚠️ **BufferGeometryUtils Note**: Three.js `mergeGeometries` merely merges attribute buffers into a single draw call. It does **NOT** perform a solid CSG boolean union and does not delete interior hidden faces. Use deliberate topological authoring.

### Scale 3: Surface & Material Response
- Detail must survive at the actual camera distance. Avoid uniform procedural noise, random scratches, or gratuitous subdivision.
- Give materials distinct physical identities: soft tissue requires subsurface scattering/transmission; metal requires low roughness and high metallic response; stone requires directional grain and worn contact areas.

---
