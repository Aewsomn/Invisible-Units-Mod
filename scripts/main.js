// =====================================================================
//  Invisible Units
//  by Aewsomn
//
//  Makes Mono, Poly and Mega fully transparent - body, cell glow,
//  outline, shadow, ambient light, engine glow and (for Poly/Mega)
//  weapon mounts all included, so no "wing" or leftover part stays
//  visible. Controlled by a checkbox added to Settings > Invisible
//  Units, which can be flipped on/off at any time without restarting.
// =====================================================================

Events.on(ClientLoadEvent, function(e){

    // -----------------------------------------------------------------
    // Build one shared, fully transparent 2x2 texture region at runtime.
    // Doing it this way (instead of shipping a PNG) avoids any risk of
    // atlas name/prefix mismatches - this region is always guaranteed
    // to exist and to be fully see-through.
    // -----------------------------------------------------------------
    var Pixmap = Packages.arc.graphics.Pixmap;
    var Texture = Packages.arc.graphics.Texture;
    var TextureRegion = Packages.arc.graphics.g2d.TextureRegion;
    var Color = Packages.arc.graphics.Color;

    var blankPixmap = new Pixmap(2, 2);
    blankPixmap.fill(Color.clear);
    var blankTexture = new Texture(blankPixmap);
    blankPixmap.dispose();
    var blankRegion = new TextureRegion(blankTexture);

    // -----------------------------------------------------------------
    // The units this mod affects.
    // -----------------------------------------------------------------
    var targets = [UnitTypes.mono, UnitTypes.poly, UnitTypes.mega];

    // -----------------------------------------------------------------
    // Snapshot every visual field we're going to touch, per unit type,
    // so the "normal" state can always be restored exactly.
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

        saved.push({
            type: type,
            region: type.region,
            cellRegion: type.cellRegion,
            outlineRegion: type.outlineRegion,
            shadowRegion: type.shadowRegion,
            softShadowRegion: type.softShadowRegion,
            previewRegion: type.previewRegion,
            lightRadius: type.lightRadius,
            trailLength: type.trailLength,
            engines: type.engines.copy(),
            weapons: weaponSnaps
        });
    }

    // -----------------------------------------------------------------
    // Switches every saved unit type between normal and fully invisible.
    // -----------------------------------------------------------------
    function applyState(invisible){
        for(var i = 0; i < saved.length; i++){
            var s = saved[i];
            var type = s.type;

            if(invisible){
                type.region = blankRegion;
                type.cellRegion = blankRegion;
                type.outlineRegion = blankRegion;
                type.shadowRegion = blankRegion;
                type.softShadowRegion = blankRegion;
                type.previewRegion = blankRegion;
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
                type.region = s.region;
                type.cellRegion = s.cellRegion;
                type.outlineRegion = s.outlineRegion;
                type.shadowRegion = s.shadowRegion;
                type.softShadowRegion = s.softShadowRegion;
                type.previewRegion = s.previewRegion;
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
    // Persistent setting key. checkPref() below both stores the value
    // under this name and shows it as the checkbox label.
    // -----------------------------------------------------------------
    var settingName = "Invisible Units Enabled";

    // Sync visuals to whatever was saved from a previous session
    // (or "normal" the very first time the mod is ever loaded).
    applyState(Core.settings.getBool(settingName, false));

    // Add the toggle to Settings > Invisible Units.
    Vars.ui.settings.addCategory("Invisible Units", function(table){
        table.checkPref(settingName, false, function(value){
            applyState(value);
        });
    });

    Log.info("[Invisible Units] loaded - mono/poly/mega transparency toggle ready.");
});
