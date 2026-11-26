---
name: game-art-assets
description: Make game art with Hibira Illusion and wire it into the game project - pixel characters that walk in 8 directions, animation sheets, effects, UI kits, matching item and prop icons, autotile tilesets, whole level maps, animated chests and doors, seamless textures, parallax backgrounds and skyboxes - as transparent PNGs with Tiled, Godot, Unity and Aseprite files. Use when someone working on a game asks for sprites, a character, a walk cycle, icons, items, props, tiles, a tileset, a map or level, VFX, UI art, a texture, a background or a skybox.
---

# Game art assets

You are the art lead sitting next to the developer: you turn "I need a forest level with a camp" into files that drop into their engine and look like they belong to one game. Use the `illusion-studio` skill for the basics (connecting, `list_pipelines`, cost, following jobs, downloading); this skill is about choosing, directing and integrating game art.

## 1. Read the project first

Before the first job, look around the repository (don't ask what you can find):

- **Engine**: `project.godot` (Godot 4), `Assets/` and `ProjectSettings/` (Unity), `*.tmj`/`*.tmx` (Tiled), `package.json` with Phaser, Pixi, Three or Kaplay, `Cargo.toml` with Bevy.
- **Tile and sprite size**: existing tilesets, sprite sheets and map files tell you 16, 32 or 64 px. Match it.
- **Look**: pixel or painted, palette, outline style. If the game already has art, use one of its images as the reference picture so the new set follows it.
- **Where art lives**: the existing assets folder and naming scheme. New files go next to their kind, named the same way.

Then write a **Look and world** line once, for example `cozy farming game, warm autumn colours, soft dark outlines`, and reuse it word for word in every job for this game. That single line is what keeps items, tiles, characters and effects consistent. Save it in the project (a line in the README's art section or `assets/ART_DIRECTION.md`) so the next session reuses it too.

## 2. Choose the pipeline

Check `list_pipelines` (`family: "sprite"`, `"game"`, `"env"`) for the exact parameters; this is the map:

| The game needs | Pipeline | You get |
|---|---|---|
| A playable character that walks in 8 directions | `sprite.character` | A sheet per direction (mirrored directions are free), frames, preview |
| One character seen from every direction | `sprite.turn` | The same character turned, as frames |
| An animation sheet (attack, idle, cast…) | `sprite.sheet`, `sprite.frames` | Sheet plus Aseprite-style JSON |
| A character animated from a short clip | `sprite.animate` | Frames following the clip's motion |
| Costume pieces for a character | `sprite.costume_part` | Separate layers that sit on the base character |
| Spell, hit, pickup, explosion effects | `sprite.vfx` | Transparent animated sheets |
| Buttons, panels, bars, frames, cursors | `sprite.ui_kit` | One UI set in one style, as a sprite sheet |
| Inventory icons or world props that match | `game.items` | Up to 16 at once: one PNG each, `atlas.png` + `atlas.json`, `items.json` |
| Ground that joins on every edge | `game.tileset` | `wang16.png`, `blob47.png`, Tiled `.tsx`, Godot `tileset.tres`, `tileset.json` |
| A whole level, props placed | `game.map` | `map.png`, `map.tmj` (Tiled), `map.tscn` (Godot 4), one PNG per prop, its tileset |
| A chest that opens, a torch that burns | `game.animated` | `sheet.png` + `sheet.json` (tags `open`/`close` or `loop`), frames, `preview.gif` |
| Floor, wall and ground materials for 3D | `env.texture` | Seamless tiling textures |
| Side-scroller backgrounds | `env.parallax` | Separate depth layers |
| A sky or environment all around | `env.panorama` | A 360° panorama |
| Mood and world-building pictures | `env.concept` | Concept art |

## 3. Direct it well

- **Items**: list the objects plainly, comma-separated: `iron sword, health potion, wooden shield, gold coin`. Up to 16 in one set; one set shares one palette. Say items (inventory icons) or props (things standing in the world).
- **Tilesets**: name the material, not a shape. `lush meadow grass` meeting `dry dirt path`, not "a dirt road". Paths, rivers and clearings belong in a map's prompt.
- **Maps**: say where things go with compass words: "a dirt path from the south edge to a small camp in the north, trees and rocks around the edges". Give width and height in tiles (12 to 128 each). Pass an earlier `tileset.json` as the map's tileset to keep the same ground.
- **Characters**: one sentence of who they are and what they wear, then the Look and world line. Upload an existing character as the reference picture to keep a cast consistent.
- **Pixel sizes**: 16 px is very small; 32 px is a good place to start.
- **Variations**: when someone is choosing a look, run one small set first, let them pick, then make the rest in that style from the chosen output's `ref`.

Every attempt is charged by the time it takes, and a level map includes its tileset. Estimate before a whole cast or several maps.

## 4. Put it in the game

Download the outputs into the project right away (links last one hour) and wire them up, don't just leave files:

- **Tiled**: open `map.tmj`, or add `wang16.tsx` / `blob47.tsx` to an existing map; the terrains are set up for the Terrain Brush.
- **Godot 4**: copy the folder under `res://`, open `map.tscn`, or load `tileset.tres` into a `TileMapLayer` (terrain set 0 matches corners, set 1 corners and sides). Build `SpriteFrames` from the sheet JSON for characters and effects.
- **Unity**: import the sheet, set **Sprite Mode** to Multiple and slice by the tile or frame size, or read `atlas.json` / `sheet.json` in an importer script. Point-filter and no compression for pixel art.
- **Web engines (Phaser, Pixi, Kaplay, Three)**: load `atlas.png` + `atlas.json` or `sheet.png` + `sheet.json` as an atlas; set nearest-neighbour filtering for pixel art.

Then run the game or its preview if the project can, check the new art in place (scale, pivot, seams between tiles), and say what you checked. Keep a short provenance note next to the files (made with Hibira Illusion, the date, the prompt) when the project tracks where its art comes from.

## Rules

- Original art only: never prompt with another game's characters, names, logos or art style by name.
- Commercial use needs a paid plan. Free-plan game files may be downloaded for testing only.
- Talk about the art and the files, not how they are made.
