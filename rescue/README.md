# Integrated rescue sequence

The 100-point game owns this copy of the approved phone animation and rescue scene. The independent biome/rescue preview remains separate.

Phone animation runs after the existing correct wildlife-contact answer, then returns to the original report question. No quiz rewards are changed.

Arrival runs after the final clearance answer only when the animal was reported and either is severely injured, or is dead with pouchChecked, joeyFound and followupReported. The original barrier, relocation, pouch and follow-up steps remain intact. Incident timers pause while the sequence is active. Arrival cannot be skipped. The original clearance continuation runs only after vehicle arrival, fade and handover; injured cases then use the original controlled departure, and joey cases reach Resume Journey.

Regression check: node tests/rescue-integration.cjs from repository root.
