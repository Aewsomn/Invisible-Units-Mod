# Transparent Support Units

**Author:** Aewsomn
**Game version:** Mindustry v159+

Turns the whole mono support-unit line - **Mono, Poly, Mega, Quad, and Oct**
- into "ghosts": mostly see-through, with a clear team-colored outline so
you can still spot and track them. Their shadow, ambient light glow,
engine glow, thruster trail, and (for Poly/Mega) weapon-mount nubs are
hidden too, so nothing but the ghosted silhouette shows. These units draw
their wings as part of the main body art rather than as a separate piece,
so there's no leftover solid "wing" left behind either.

## Install

**In-game (recommended):**
1. Open Mindustry → **Mods** → **Import mod**.
2. Select `transparent-support-units.zip` (no need to unzip it first).
3. Restart Mindustry when prompted.


## Usage

Two ways to toggle it, both control the same on/off state:

- **Settings → Transparent Support Units** — a checkbox.
- **Press F9** — instant toggle, no menu needed. Rebindable any time from
  **Settings → Controls → Transparent Support Units** if F9 clashes with
  something else on your setup.

Either way it applies immediately, works mid-game, and is remembered
between play sessions.

## Notes

- This only changes local rendering — it doesn't touch unit stats,
  hitboxes, or game logic, so it's safe for singleplayer and campaign.
- `hidden: true` is set in `mod.hjson` so this mod won't cause a
  version-mismatch kick when joining multiplayer servers that don't have it.
- The outline thickness scales with each unit's size, since Oct is well
  over 10x the size of Mono - one fixed thickness wouldn't look right on
  both.
