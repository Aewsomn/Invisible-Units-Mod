// =====================================================================
//  Transparent Support Units
//  by Aewsomn
//
//  Turns Mono, Poly, Mega, Quad and Oct (the whole mono support-unit
//  line) into "ghosts": mostly see-through, with a team-colored outline
//  so they're still trackable. Ambient light, engine glow, thruster
//  trail, shadow and weapon-mount nubs are hidden so nothing but the
//  ghosted silhouette shows - no leftover solid parts, "wings" included,
//  since these units draw their wings as part of the main body sprite.
//
//  Toggle it from Settings > Transparent Support Units, or by pressing F9
//  (rebindable in Settings > Controls > Transparent Support Units). Both controls
//  drive the same on/off state and it's remembered between sessions.
// =====================================================================

Events.on(ClientLoadEvent, function(e){

    var Pixmap = Packages.arc.graphics.Pixmap;
    var Texture = Packages.arc.graphics.Texture;
    var TextureRegion = Packages.arc.graphics.g2d.TextureRegion;
    var Color = Packages.arc.graphics.Color;
    var KeyCode = Packages.arc.input.KeyCode;
    var KeyBindCls = Packages.arc.input.KeyBind;
    var Layer = Packages.mindustry.graphics.Layer;
    var Groups = Packages.mindustry.gen.Groups;

    // -----------------------------------------------------------------
    // A shared, fully transparent 2x2 texture region, built at runtime
    // instead of shipped as a PNG - guarantees it always exists and is
    // always fully see-through, regardless of atlas naming rules. Used
    // to hide shadows and weapon-mount sprites completely.
    // -----------------------------------------------------------------
    var blankPixmap = new Pixmap(2, 2);
    blankPixmap.fill(Color.clear);
    var blankTexture = new Texture(blankPixmap);
    blankPixmap.dispose();
    var blankRegion = new TextureRegion(blankTexture);

    // -----------------------------------------------------------------
    // The whole mono line.
    // -----------------------------------------------------------------
    var targets = [UnitTypes.mono, UnitTypes.poly, UnitTypes.mega, UnitTypes.quad, UnitTypes.oct];

    // -----------------------------------------------------------------
    // "Ghost" look tuning.
    // -----------------------------------------------------------------
    var FILL_ALPHA = 0.3;      // how visible the see-through body/cell fill is
    var OUTLINE_ALPHA = 0.95;  // how visible the outline ring is
    var OFFSET_DIRS = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, 0.7071], [-0.7071, -0.7071]
    ];

    // -----------------------------------------------------------------
    // Snapshot every field we touch, per unit type, so "normal" can
    // always be restored exactly. Also works out an outline thickness
    // that scales with each unit's size (Oct is over 10x the size of
    // Mono, so one fixed thickness wouldn't look right on both).
    // -----------------------------------------------------------------
    var saved = [];

    for(var i = 0; i < targets.length; i++){
        var type = targets[i];
        if(type == null) continue;

        var weaponSnaps = [];
        type.weapons.each(function(w){
            weaponSnaps.push({
                weapon: w,
                region: w.region,
                cellRegion: w.cellRegion,
                outlineRegion: w.outlineRegion,
                heatRegion: w.heatRegion
            });
        });

        var outlineOffset = Math.max(0.8, Math.min(3.5, type.hitSize * 0.05));

        saved.push({
            type: type,
            outlineOffset: outlineOffset,
            drawBody: type.drawBody,
            drawCell: type.drawCell,
            drawItems: type.drawItems,
            shadowRegion: type.shadowRegion,
            softShadowRegion: type.softShadowRegion,
            lightRadius: type.lightRadius,
            trailLength: type.trailLength,
            engines: type.engines.copy(),
            weapons: weaponSnaps
        });
    }

    // -----------------------------------------------------------------
    // Suppresses (or restores) the game's own full-strength rendering
    // for these units. The ghost body/cell/outline itself is drawn
    // separately every frame below, using the real sprites at custom
    // alpha - this only turns off the normal solid version underneath.
    // -----------------------------------------------------------------
    function applySuppression(ghosted){
        for(var i = 0; i < saved.length; i++){
            var s = saved[i];
            var type = s.type;

            if(ghosted){
                type.drawBody = false;
                type.drawCell = false;
                type.drawItems = false;
                type.shadowRegion = blankRegion;
                type.softShadowRegion = blankRegion;
                type.lightRadius = 0;
                type.trailLength = 0;
                type.engines.clear();

                for(var j = 0; j < s.weapons.length; j++){
                    var ws = s.weapons[j];
                    ws.weapon.region = blankRegion;
                    ws.weapon.cellRegion = blankRegion;
                    ws.weapon.outlineRegion = blankRegion;
                    ws.weapon.heatRegion = blankRegion;
                }
            } else {
                type.drawBody = s.drawBody;
                type.drawCell = s.drawCell;
                type.drawItems = s.drawItems;
                type.shadowRegion = s.shadowRegion;
                type.softShadowRegion = s.softShadowRegion;
                type.lightRadius = s.lightRadius;
                type.trailLength = s.trailLength;
                type.engines.clear();
                type.engines.addAll(s.engines);

                for(var k = 0; k < s.weapons.length; k++){
                    var ws2 = s.weapons[k];
                    ws2.weapon.region = ws2.region;
                    ws2.weapon.cellRegion = ws2.cellRegion;
                    ws2.weapon.outlineRegion = ws2.outlineRegion;
                    ws2.weapon.heatRegion = ws2.heatRegion;
                }
            }
        }
    }

    // -----------------------------------------------------------------
    // Persisted on/off state, shared by the settings checkbox and the
    // keybind below.
    // -----------------------------------------------------------------
    var settingName = "Transparent Support Units Enabled";
    var enabled = Core.settings.getBool(settingName, false);

    function setEnabled(value){
        enabled = value;
        Core.settings.put(settingName, value);
        applySuppression(value);
    }

    // Sync visuals to whatever was saved from a previous session.
    applySuppression(enabled);

    // Settings > Transparent Support Units checkbox.
    Vars.ui.settings.addCategory("Transparent Support Units", function(table){
        table.checkPref(settingName, false, function(value){
            setEnabled(value);
        });
    });

    // Keybind, default F9. Shows up in Settings > Controls under its
    // own "Transparent Support Units" category and can be rebound there.
    var toggleKey = KeyBindCls.add("transparent-support-units-toggle", new KeyBindCls.Axis(KeyCode.f9), "Transparent Support Units");

    Events.run(Trigger.update, function(){
        if(Core.input.keyTap(toggleKey)){
            setEnabled(!enabled);
        }
    });

    // -----------------------------------------------------------------
    // Draws the ghost look every frame: a team-colored outline (made
    // from offset copies of the real silhouette, so it always matches
    // the unit's actual shape) plus a mostly-transparent fill on top.
    // -----------------------------------------------------------------
    Events.run(Trigger.draw, function(){
        if(!enabled) return;

        Groups.unit.each(function(u){
            var s = null;
            for(var i = 0; i < saved.length; i++){
                if(saved[i].type === u.type){
                    s = saved[i];
                    break;
                }
            }
            if(s == null) return;
            if(u.inFogTo(Vars.player.team())) return;

            var type = s.type;
            var rot = u.rotation - 90;

            Draw.z(Layer.flyingUnit);

            Draw.color(u.team.color, OUTLINE_ALPHA);
            for(var o = 0; o < OFFSET_DIRS.length; o++){
                var dx = OFFSET_DIRS[o][0] * s.outlineOffset;
                var dy = OFFSET_DIRS[o][1] * s.outlineOffset;
                Draw.rect(type.region, u.x + dx, u.y + dy, rot);
            }
            Draw.reset();

            Draw.color(1, 1, 1, FILL_ALPHA);
            Draw.rect(type.region, u.x, u.y, rot);
            if(Core.atlas.isFound(type.cellRegion)){
                Draw.rect(type.cellRegion, u.x, u.y, rot);
            }
            Draw.reset();
        });
    });

    Log.info("[Transparent Support Units] loaded - mono/poly/mega/quad/oct ghost toggle ready (default F9).");
});
