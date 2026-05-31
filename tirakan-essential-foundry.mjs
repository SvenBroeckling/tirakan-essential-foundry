import { TIRAKAN } from "./module/config.mjs";
import { TirakanActor, TirakanItem } from "./module/documents.mjs";
import { CharacterDataModel, NscDataModel, WeaponDataModel, ArmorDataModel, GearDataModel, SpellDataModel } from "./module/data-models.mjs";
import { TirakanActorSheet } from "./module/sheets/actor-sheet.mjs";
import { TirakanCharacterImporter } from "./module/importer.mjs";

const SYSTEM_ID = "tirakan-essential";

Hooks.once("init", () => {
  game.tirakan = {
    config: TIRAKAN,
    applications: { TirakanCharacterImporter }
  };

  CONFIG.Actor.documentClass = TirakanActor;
  CONFIG.Item.documentClass = TirakanItem;

  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    nsc: NscDataModel
  };

  CONFIG.Item.dataModels = {
    weapon: WeaponDataModel,
    armor: ArmorDataModel,
    gear: GearDataModel,
    spell: SpellDataModel
  };

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.wounds", "resources.burden", "resources.arkana", "resources.favor", "resources.omen"],
      value: ["derived.initiative"]
    },
    nsc: {
      bar: ["resources.wounds", "resources.burden"],
      value: ["derived.initiative"]
    }
  };

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, TirakanActorSheet, {
    label: "TIRAKAN.Sheet.Actor",
    types: ["character", "nsc"],
    makeDefault: true
  });

  game.settings.registerMenu(SYSTEM_ID, "importCharacter", {
    name: "TIRAKAN.Import.MenuName",
    label: "TIRAKAN.Import.MenuLabel",
    hint: "TIRAKAN.Import.MenuHint",
    icon: "fa-solid fa-file-import",
    type: TirakanCharacterImporter,
    restricted: true
  });

  game.settings.register(SYSTEM_ID, "welcomeChatMessageShown", {
    scope: "client",
    config: false,
    type: Boolean,
    default: false
  });
});

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  if (game.settings.get(SYSTEM_ID, "welcomeChatMessageShown")) return;

  await ChatMessage.create({
    speaker: { alias: game.i18n.localize("TIRAKAN.Welcome.Title") },
    content: welcomeChatContent()
  });
  await game.settings.set(SYSTEM_ID, "welcomeChatMessageShown", true);
});

function welcomeChatContent() {
  return `<div class="tirakan-chat-card tirakan-welcome-card">
    <h3>${game.i18n.localize("TIRAKAN.Welcome.Title")}</h3>
    <ul>
      <li>${game.i18n.localize("TIRAKAN.Welcome.ImportHint")}</li>
      <li>${game.i18n.localize("TIRAKAN.Welcome.PdfHint")}</li>
      <li>${game.i18n.localize("TIRAKAN.Welcome.LicenseHint")}</li>
    </ul>
  </div>`;
}
