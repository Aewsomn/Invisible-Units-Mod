// Invisible units - Aewsomn
// Mindustry v8 / build 159.7+
// Client-side visual mod. Unit behavior, stats, weapons and collision are unchanged.

const Core = Java.type("arc.Core");
const Vars = Java.type("mindustry.Vars");
const UnitTypes = Java.type("mindustry.content.UnitTypes");
const Events = Java.type("mindustry.game.EventType");

const settingKey = "invisible-units-enabled";
const targets = [UnitTypes.mono, UnitTypes.poly, UnitTypes.mega];

// A 4x4 fully transparent sprite packaged with the mod.
let transparent;

const original = [];

function remember(type){
    original.push({
        type: type,
        region: type.region,
        outlineRegion: type.outlineRegion,
        previewRegion: type.previewRegion,
        cellRegion: type.cellRegion,
        itemCircleRegion: type.itemCircleRegion,
        softShadowRegion: type.softShadowRegion,
        shadowRegion: type.shadowRegion,
        footRegion: type.footRegion,
        drawBody: type.drawBody,
        drawCell: type.drawCell,
        drawItems: type.drawItems,
        drawSoftShadow: type.drawSoftShadow,
        drawShields: type.drawShields,
        parts: type.parts.copy()
    });
}

targets.forEach(remember);

function getTransparentRegion(){
    if(transparent != null) return transparent;
    transparent = Core.atlas.find("invisible-units-transparent");
    return transparent;
}

function setInvisible(enabled){
    if(Vars.headless) return;

    const blank = getTransparentRegion();
    if(blank == null || blank.name === "error"){
        print("Invisible units: transparent sprite could not be found; leaving units unchanged.");
        return;
    }

    original.forEach(o => {
        const t = o.type;
        if(enabled){
            // Replace the visible unit regions with the packaged transparent region.
            t.region = blank;
            t.outlineRegion = blank;
            t.previewRegion = blank;
            t.cellRegion = blank;
            t.itemCircleRegion = blank;
            t.softShadowRegion = blank;
            t.shadowRegion = blank;
            t.footRegion = blank;

            // Safety net for extra body rendering and animated visual parts.
            t.drawBody = false;
            t.drawCell = false;
            t.drawItems = false;
            t.drawSoftShadow = false;
            t.drawShields = false;
            t.parts.clear();
        }else{
            t.region = o.region;
            t.outlineRegion = o.outlineRegion;
            t.previewRegion = o.previewRegion;
            t.cellRegion = o.cellRegion;
            t.itemCircleRegion = o.itemCircleRegion;
            t.softShadowRegion = o.softShadowRegion;
            t.shadowRegion = o.shadowRegion;
            t.footRegion = o.footRegion;
            t.drawBody = o.drawBody;
            t.drawCell = o.drawCell;
            t.drawItems = o.drawItems;
            t.drawSoftShadow = o.drawSoftShadow;
            t.drawShields = o.drawShields;
            t.parts.clear();
            t.parts.addAll(o.parts);
        }
    });
}


Events.on(Events.ClientLoadEvent, e => {
    Core.settings.defaults(settingKey, false);

    // Custom settings category; the checkbox updates immediately with no restart.
    Vars.ui.settings.addCategory("Invisible units", t => {
        t.checkPref(settingKey, false, value => setInvisible(value));
    });

    setInvisible(Core.settings.getBool(settingKey, false));
});
