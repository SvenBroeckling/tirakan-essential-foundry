import { ancestryRules, pathRules, bondRules } from "./rules/marks.mjs";
import { weaponRules, armorRules } from "./rules/equipment.mjs";
import { magicAspectRules, spellRules } from "./rules/magic.mjs";

export const TIRAKAN = {
  attributes: [
    { key: "mind", de: "Geist", en: "Mind" },
    { key: "will", de: "Wille", en: "Will" },
    { key: "instinct", de: "Instinkt", en: "Instinct" },
    { key: "dexterity", de: "Geschick", en: "Dexterity" },
    { key: "body", de: "Koerper", en: "Body" },
    { key: "presence", de: "Erscheinung", en: "Presence" },
    { key: "gift", de: "Gabe", en: "Gift" },
    { key: "perception", de: "Wahrnehmung", en: "Perception" }
  ],
  difficulties: [
    { key: "easy", modifier: 20, de: "Leicht", en: "Easy" },
    { key: "standard", modifier: 0, de: "Standard", en: "Standard" },
    { key: "hard", modifier: -20, de: "Schwer", en: "Hard" },
    { key: "extreme", modifier: -40, de: "Extrem", en: "Extreme" }
  ],
  consequenceLevels: [
    { key: "none", de: "Keine", en: "None" },
    { key: "minor", de: "Gering", en: "Minor" },
    { key: "serious", de: "Ernst", en: "Serious" },
    { key: "critical", de: "Kritisch", en: "Critical" }
  ],
  conditions: [
    { key: "bleeding", de: "Blutend", en: "Bleeding" },
    { key: "burning", de: "Brennend", en: "Burning" },
    { key: "shaken", de: "Erschuettert", en: "Shaken" },
    { key: "fixed", de: "Festgesetzt", en: "Fixed" },
    { key: "destroyed", de: "Zerstoert", en: "Destroyed" }
  ],
  combatActions: [
    { key: "attack", de: "Angreifen", en: "Attack" },
    { key: "shoot", de: "Schiessen", en: "Shoot" },
    { key: "move", de: "Bewegen", en: "Move" },
    { key: "sprint", de: "Sprinten", en: "Sprint" },
    { key: "cover", de: "Deckung suchen", en: "Take Cover" },
    { key: "aim", de: "Zielen", en: "Aim" },
    { key: "useItem", de: "Gegenstand benutzen", en: "Use Item" },
    { key: "cast", de: "Zaubern", en: "Cast" },
    { key: "support", de: "Unterstuetzen", en: "Support" },
    { key: "withdraw", de: "Zurueckziehen", en: "Withdraw" },
    { key: "compose", de: "Sich fassen", en: "Compose" }
  ],
  centuryLevels: {
    1: { faith: 1, magic: 1 },
    2: { faith: 1, magic: 2 },
    3: { faith: 1, magic: 3 },
    4: { faith: 1, magic: 4 },
    5: { faith: 1, magic: 5 },
    6: { faith: 2, magic: 4 },
    7: { faith: 3, magic: 3 },
    8: { faith: 4, magic: 2 },
    9: { faith: 5, magic: 1 },
    10: { faith: 6, magic: 0 }
  },
  ancestryRules,
  pathRules,
  bondRules,
  ancestries: ancestryRules.map((rule) => rule.name),
  paths: pathRules.map((rule) => rule.name),
  bonds: bondRules.map((rule) => rule.name),
  weaponRules,
  armorRules,
  magicAspectRules,
  spellRules
};
