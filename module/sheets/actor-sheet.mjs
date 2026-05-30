import { TIRAKAN } from "../config.mjs";
import { SPELL_CASTING_LEVELS } from "../rolls.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const ActorSheetV2 = foundry.applications.sheets?.ActorSheetV2 ?? foundry.applications.api.DocumentSheetV2;

export class TirakanActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["tirakan", "tirakan-actor-sheet"],
    position: {
      width: 760,
      height: 820
    },
    window: {
      resizable: true
    },
    actions: {
      changeTab: TirakanActorSheet.#changeTab,
      rollAttribute: TirakanActorSheet.#rollAttribute,
      rollSpell: TirakanActorSheet.#rollSpell,
      addSkill: TirakanActorSheet.#addSkill,
      removeSkill: TirakanActorSheet.#removeSkill,
      addCondition: TirakanActorSheet.#addCondition,
      removeCondition: TirakanActorSheet.#removeCondition,
      editSection: TirakanActorSheet.#editSection,
      doneEdit: TirakanActorSheet.#doneEdit,
      setAttribute: TirakanActorSheet.#setAttribute,
      setSkillRank: TirakanActorSheet.#setSkillRank,
      setResource: TirakanActorSheet.#setResource
    }
  };

  static PARTS = {
    form: {
      template: "systems/tirakan-essential/templates/actor/actor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const editingSection = this.editingSection ?? null;
    const activeTab = this.activeTab ?? "core";
    const spellRows = this.#spellRows(actor);
    return {
      ...context,
      actor,
      system,
      config: TIRAKAN,
      editable: this.isEditable,
      editingSection,
      activeTab,
      activeCoreTab: activeTab === "core",
      activeSkillsTab: activeTab === "skills",
      activeSpellsTab: activeTab === "spells",
      activeConditionsTab: activeTab === "conditions",
      activeNotesTab: activeTab === "notes",
      tabs: [
        {
          id: "core",
          icon: "fa-solid fa-circle-nodes",
          label: game.i18n.localize("TIRAKAN.Tab.Core"),
          active: activeTab === "core"
        },
        {
          id: "skills",
          icon: "fa-solid fa-list-check",
          label: game.i18n.localize("TIRAKAN.Section.Skills"),
          active: activeTab === "skills"
        },
        {
          id: "spells",
          icon: "fa-solid fa-wand-sparkles",
          label: game.i18n.localize("TIRAKAN.Section.Spells"),
          active: activeTab === "spells"
        },
        {
          id: "conditions",
          icon: "fa-solid fa-heart-pulse",
          label: game.i18n.localize("TIRAKAN.Section.Conditions"),
          active: activeTab === "conditions"
        },
        {
          id: "notes",
          icon: "fa-solid fa-feather",
          label: game.i18n.localize("TIRAKAN.Section.Notes"),
          active: activeTab === "notes"
        }
      ],
      editIdentity: editingSection === "identity",
      editAttributes: editingSection === "attributes",
      editResources: editingSection === "resources",
      editSkills: editingSection === "skills",
      editConditions: editingSection === "conditions",
      editNotes: editingSection === "notes",
      isCharacter: actor.type === "character",
      isNsc: actor.type === "nsc",
      attributeRows: TIRAKAN.attributes.map((attribute) => ({
        ...attribute,
        label: game.i18n.lang === "de" ? attribute.de : attribute.en,
        value: system.attributes?.[attribute.key] ?? 0,
        target: 30 + (system.attributes?.[attribute.key] ?? 0) * 10,
        editing: editingSection === "attributes",
        circles: [0, 1, 2, 3, 4].map((value) => ({
          value,
          selected: value === (system.attributes?.[attribute.key] ?? 0)
        }))
      })),
      skillRows: (system.skills ?? []).map((skill, index) => ({
        ...skill,
        index,
        editing: editingSection === "skills",
        circles: [0, 1, 2, 3, 4].map((value) => ({
          value,
          selected: value === skill.rank
        }))
      })),
      spellRows,
      hasSpellRows: spellRows.length > 0,
      resourceRows: [
        { key: "wounds", label: game.i18n.localize("TIRAKAN.Resource.Wounds"), resource: system.resources.wounds },
        { key: "burden", label: game.i18n.localize("TIRAKAN.Resource.Burden"), resource: system.resources.burden },
        { key: "omen", label: game.i18n.localize("TIRAKAN.Resource.Omen"), resource: system.resources.omen },
        { key: "arkana", label: game.i18n.localize("TIRAKAN.Resource.Arkana"), resource: system.resources.arkana },
        { key: "favor", label: game.i18n.localize("TIRAKAN.Resource.Favor"), resource: system.resources.favor }
      ].map((row) => ({
        ...row,
        editing: editingSection === "resources",
        circles: Array.from({ length: Math.max(1, Math.min(Number(row.resource.max) || 0, 12)) + 1 }, (_, index) => ({
          value: index,
          selected: index === (Number(row.resource.value) || 0)
        }))
      })),
      conditionOptions: TIRAKAN.conditions.map((condition) => ({
        ...condition,
        label: game.i18n.lang === "de" ? condition.de : condition.en,
        active: (system.conditions ?? []).includes(condition.key),
        editing: editingSection === "conditions",
        action: (system.conditions ?? []).includes(condition.key) ? "removeCondition" : "addCondition"
      }))
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.isEditable) return;

    this.element.querySelectorAll("input[data-update], textarea[data-update], select[data-update]").forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.currentTarget;
        const value = target.type === "number" ? Number(target.value) : target.value;
        this.document.update({ [target.dataset.update]: value });
      });
    });
  }

  static async #changeTab(event, target) {
    this.activeTab = target.dataset.tab;
    this.render();
  }

  static async #rollAttribute(event, target) {
    const attribute = target.dataset.attribute;
    await this.document.rollAttribute(attribute);
  }

  static async #rollSpell(event, target) {
    const spellIndex = Number(target.dataset.spellIndex);
    const spell = this.#spellRows(this.document)[spellIndex] ?? {};
    const spellName = spell.name ?? target.dataset.spellName ?? "";
    const levelKey = await chooseSpellCastingLevel();
    if (!levelKey) return;
    await this.document.rollSpell(spellName, { levelKey, description: spell.description ?? "" });
  }

  static async #addSkill() {
    const skills = foundry.utils.deepClone(this.document.system.skills ?? []);
    skills.push({ name: "", rank: 1, usedReroll: false, usedIgnore: false });
    await this.document.update({ "system.skills": skills });
  }

  static async #removeSkill(event, target) {
    const index = Number(target.dataset.index);
    const skills = foundry.utils.deepClone(this.document.system.skills ?? []);
    skills.splice(index, 1);
    await this.document.update({ "system.skills": skills });
  }

  static async #addCondition(event, target) {
    const key = target.dataset.condition;
    const conditions = new Set(this.document.system.conditions ?? []);
    conditions.add(key);
    await this.document.update({ "system.conditions": Array.from(conditions) });
  }

  static async #removeCondition(event, target) {
    const key = target.dataset.condition;
    const conditions = (this.document.system.conditions ?? []).filter((condition) => condition !== key);
    await this.document.update({ "system.conditions": conditions });
  }

  static async #editSection(event, target) {
    this.editingSection = target.dataset.section;
    const tabBySection = {
      attributes: "core",
      resources: "core",
      skills: "skills",
      spells: "spells",
      conditions: "conditions",
      notes: "notes"
    };
    this.activeTab = tabBySection[this.editingSection] ?? this.activeTab ?? "core";
    this.render();
  }

  static async #doneEdit() {
    this.editingSection = null;
    this.render();
  }

  static async #setAttribute(event, target) {
    const attribute = target.dataset.attribute;
    const value = Number(target.dataset.value);
    await this.document.update({ [`system.attributes.${attribute}`]: value });
  }

  static async #setSkillRank(event, target) {
    const index = Number(target.dataset.index);
    const value = Number(target.dataset.value);
    await this.document.update({ [`system.skills.${index}.rank`]: value });
  }

  static async #setResource(event, target) {
    const resource = target.dataset.resource;
    const value = Number(target.dataset.value);
    await this.document.update({ [`system.resources.${resource}.value`]: value });
  }

  #spellRows(actor) {
    const itemRows = actor.items
      .filter((item) => item.type === "spell")
      .map((item, index) => ({
        index,
        name: item.name,
        aspect: item.system.aspect,
        category: item.system.category,
        element: item.system.element,
        minimumRoll: item.system.minimumRoll,
        cost: item.system.cost,
        range: item.system.range,
        duration: item.system.duration,
        area: item.system.area,
        castingTime: item.system.castingTime || item.system.action,
        resisted: item.system.resisted,
        description: item.system.description
      }));
    if (itemRows.length > 0) return itemRows;

    return (actor.system.supernatural?.spells ?? []).filter(Boolean).map((name, index) => {
      const rule = TIRAKAN.spellRules.find((entry) => entry.name === name);
      return {
        index,
        name,
        aspect: rule?.aspect ?? "",
        category: rule?.category ?? "",
        element: rule?.element ?? "",
        minimumRoll: rule?.minimumRoll ?? "",
        cost: rule?.cost ?? "",
        range: rule?.range ?? "",
        duration: rule?.duration ?? "",
        area: rule?.area ?? "",
        castingTime: rule?.castingTime || rule?.action || "",
        resisted: rule?.resisted ?? "",
        description: rule?.description ?? ""
      };
    });
  }
}

async function chooseSpellCastingLevel() {
  const buttons = SPELL_CASTING_LEVELS.map((level) => ({
    action: level.key,
    label: game.i18n.localize(level.label)
  }));
  const content = `<div class="tirakan-spell-level-dialog">
    <p>${game.i18n.localize("TIRAKAN.Magic.ChooseLevel")}</p>
    <ul>
      ${SPELL_CASTING_LEVELS.map((level) => `<li><strong>${game.i18n.localize(level.label)}</strong>: ${spellCastingLevelSummary(level)}</li>`).join("")}
    </ul>
  </div>`;

  if (foundry.applications.api.DialogV2) {
    return foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("TIRAKAN.Magic.ChooseLevel") },
      content,
      buttons,
      rejectClose: false
    });
  }

  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.localize("TIRAKAN.Magic.ChooseLevel"),
      content,
      buttons: Object.fromEntries(buttons.map((button) => [button.action, {
        label: button.label,
        callback: () => resolve(button.action)
      }])),
      close: () => resolve(null)
    }).render(true);
  });
}

function spellCastingLevelSummary(level) {
  const ruleKeys = {
    low: "TIRAKAN.Magic.Rule.Low",
    normal: "TIRAKAN.Magic.Rule.Normal",
    hard: "TIRAKAN.Magic.Rule.Hard",
    catastrophic: "TIRAKAN.Magic.Rule.Catastrophic"
  };
  return game.i18n.localize(ruleKeys[level.key]);
}
