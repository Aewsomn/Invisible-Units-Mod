# Invisible Units

**Author:** Aewsomn
**Game version:** Mindustry v159+

Makes the Mono, Poly, and Mega core support units completely transparent —
body, glow "cell" details, outline, ground shadow, ambient light, engine
glow, and (for Poly/Mega) their small weapon mounts. Nothing is left
half-visible, since these units don't have a separate wing sprite — the
wings are part of the main body art, so hiding the body hides them too.

## Install

**In-game (recommended):**
1. Open Mindustry → **Mods** → **Import mod**.
2. Select `invisible-units.zip` (no need to unzip it first).
3. Restart Mindustry when prompted.

**Discord:** just drag `invisible-units.zip` into a channel — anyone who
downloads it can import it the same way above.

## Usage

Go to **Settings → Invisible Units** and flip the checkbox. It applies
immediately, works mid-game, and can be switched back to normal sprites
at any time — no restart needed to toggle it, only to install/remove the
mod itself.

The setting is saved, so it stays as you left it between play sessions.

## Notes

- This only changes local rendering — it doesn't touch unit stats, hitboxes,
  or game logic, so it's safe for singleplayer and campaign.
- `hidden: true` is set in `mod.hjson` so this mod won't cause a
  version-mismatch kick when joining multiplayer servers that don't have it.
