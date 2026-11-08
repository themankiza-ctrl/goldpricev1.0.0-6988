## 5. Physical Interaction, Colliders & Spatial Constraints

When an object occupies space, its physical presence must match its visual boundaries:

### Collider Envelopes Must Follow Visible Meshes
- **The Rule**: Derive colliders from actual mesh geometry. A bounding box that excludes a building's roof will allow airborne characters to fly straight through the roof.
- Moving creatures require **articulated compound colliders** or conservative whole-body capsules that encompass wings, antlers, horns, and turning clearance. A single point at the actor's root is strictly insufficient.

### Discrete Simulation vs. Render Interpolation (Fixed Timestep)
Decouple physics integration from display refresh rates (60Hz, 120Hz, ProMotion) to prevent physics tunneling and non-deterministic behavior:

```typescript
// Fixed Timestep Accumulator Pattern (Fix Your Timestep - Glenn Fiedler)
const PHYSICS_TIMESTEP = 1 / 60; // 60Hz fixed simulation rate
let accumulatedTime = 0;
let lastTime = performance.now();

export function updatePhysicsLoop(currentTime: number, physicsWorld: any) {
  const frameDelta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Cap max frame delta to prevent "spiral of death" on tab resume
  accumulatedTime += Math.min(frameDelta, 0.1);

  while (accumulatedTime >= PHYSICS_TIMESTEP) {
    physicsWorld.step(PHYSICS_TIMESTEP);
    accumulatedTime -= PHYSICS_TIMESTEP;
  }
  
  // Alpha factor for visual transform interpolation between physics states
  const interpolationAlpha = accumulatedTime / PHYSICS_TIMESTEP;
  return interpolationAlpha;
}
```

---
