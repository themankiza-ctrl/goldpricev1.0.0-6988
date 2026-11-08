## 1. The 10-Step Spatial Reasoning & Construction Workflow

A runnable 3D scene requires disciplined spatial judgment. Follow these 10 decisions:

```
  STEP 1                STEP 2               STEP 3                 STEP 4
Visual Intent  ───►  Object Reasoning ───► Grounded Truth  ───► Construction Route
 (Direction)          (The 3 Scales)      (Scientific Claim)    (Kit / Custom / Scan)
       │
       ▼
  STEP 5                STEP 6               STEP 7                 STEP 8
Join Continuity ───► Material & Light ───► Physical Bounds  ───► Real Frame Inspection
(Skin / Layers)       (PBR Identity)       (Colliders & Time)    (Multi-Angle Capture)
       │
       ▼
  STEP 9                STEP 10
Visual Review   ───► Honest Reporting
(Anti-Slop 3D)       (Limitations & State)
```

1. **Intent & Visual Direction**: Identify what the viewer should understand, feel, or do. Decide viewing distance (overview vs. inspection vs. macro close-up). Establish how silhouette, material, lighting, camera, and motion coordinate together.
2. **Object Reasoning (The 3 Scales)**: Before selecting a template, define the silhouette, proportions, connections, surface identity, and behavior that make the hero object convincing. Solve the hardest or most distinctive object first.
3. **Grounded Representation & Scientific Truth**: Choose whether the scene is an illustration, discrete state machine, physical simulation, or recorded playback. For academic/scientific subjects, verify the chain: **Claim → Mathematical Model → Rendered Visual**. An aesthetic mesh does not certify a scientific claim.
4. **Construction Routing per Object**: Choose the right construction route (see Routing Table below) based on requirements rather than habit.
5. **Join Continuity & Topology**: At junctions where parts attach, decide whether the object requires a continuous skin, an overlapping layered covering, or separate articulated mechanical parts.
6. **Material & Lighting Direction**: Build distinct PBR responses (soft tissue, satin, brushed metal, stone, glass, diagrammatic hue). Direct lighting to reveal form: avoid clipped highlights, crushed shadows, and muddy reflections.
7. **Physical Interaction & Spatial Constraints**: Ensure colliders follow visible meshes (including roofs, overhangs, wings, and swept envelopes). Decouple simulation steps from render frames using fixed-timestep accumulators (`accumulatedTime`).
8. **Real Output Inspection**: Never describe an unobserved frame. Inspect overview, oblique angles, meaningful close-ups, and interactive states in an actual browser viewport.
9. **Visual Review & 3D Anti-Slop**: Evaluate against the 16-point 3D visual review checklist. Fix structural shape defects before adding superficial textures or post-processing bloom.
10. **Honest Reporting**: Clearly separate what was mathematically modeled, visually observed, numerically verified, and what remains an artistic simplification.

---
