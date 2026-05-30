import { TIRAKAN } from "./config.mjs";
import { attributeTarget, rollCheck, rollSpell } from "./rolls.mjs";

export class TirakanActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;
    const attributes = system.attributes ?? {};
    const body = Number(attributes.body) || 0;
    const will = Number(attributes.will) || 0;
    const dexterity = Number(attributes.dexterity) || 0;
    const mind = Number(attributes.mind) || 0;
    const century = Math.clamp(Number(system.century) || 1, 1, 10);
    const levels = TIRAKAN.centuryLevels[century] ?? TIRAKAN.centuryLevels[1];
    const rite = (system.skills ?? []).find((skill) => (skill.name ?? "").toLowerCase().includes("ritus"))?.rank ?? 0;

    system.derived.woundThreshold = 3 + body;
    system.derived.burdenThreshold = 5 + Math.floor(will / 2);
    system.derived.initiative = attributeTarget(dexterity);
    system.derived.faithLevel = levels.faith;
    system.derived.magicLevel = levels.magic;
    system.derived.invocationValue = levels.faith + rite;
    system.derived.favorLimit = 1 + Math.floor(will / 2);

    system.resources.wounds.max = system.derived.woundThreshold;
    system.resources.burden.max = system.derived.burdenThreshold;
    system.resources.omen.max = 2 + Math.floor(levels.faith / 2);
    system.resources.arkana.max = 3 + mind;
    system.resources.favor.max = 3 + will;

    for (const resource of Object.values(system.resources)) {
      resource.value = Math.clamp(Number(resource.value) || 0, 0, Number(resource.max) || 0);
    }
  }

  async rollAttribute(attribute, options = {}) {
    return rollCheck(this, { attribute, ...options });
  }

  async rollSpell(spellName, options = {}) {
    return rollSpell(this, { spellName, ...options });
  }

  async applyWounds(amount = 1) {
    const value = Number(this.system.resources.wounds.value) || 0;
    await this.update({ "system.resources.wounds.value": Math.max(0, value + Number(amount)) });
  }

  async applyBurden(amount = 1) {
    const value = Number(this.system.resources.burden.value) || 0;
    await this.update({ "system.resources.burden.value": Math.max(0, value + Number(amount)) });
  }
}

export class TirakanItem extends Item {
  get isWeapon() {
    return this.type === "weapon";
  }

  get isArmor() {
    return this.type === "armor";
  }

  get isSpell() {
    return this.type === "spell";
  }
}
