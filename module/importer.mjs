const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class TirakanCharacterImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "tirakan-character-importer",
    classes: ["tirakan", "tirakan-importer"],
    tag: "form",
    window: {
      title: "TIRAKAN.Import.Title",
      icon: "fa-solid fa-file-import"
    },
    position: {
      width: 520
    },
    form: {
      handler: TirakanCharacterImporter.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/tirakan-essential-foundry/templates/apps/import-character.hbs"
    }
  };

  async _prepareContext(options) {
    return {
      ...(await super._prepareContext(options)),
      defaultUrl: "https://tirakan.de/characters/YfD-j4_Huz7h"
    };
  }

  static async #onSubmit(event, form, formData) {
    const source = String(formData.object.url ?? "").trim();
    const mode = String(formData.object.mode ?? "create");

    try {
      const { apiUrl, hash } = buildApiUrl(source);
      const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const character = await response.json();
      const actorData = mapCharacterToActor(character, source, hash);

      let actor;
      if (mode === "update" && character.hash) {
        actor = game.actors.find((entry) => entry.type === "character" && entry.system.source?.hash === character.hash);
        if (actor) await actor.update(actorData);
      }
      if (!actor) actor = await Actor.implementation.create(actorData);

      ui.notifications.info(game.i18n.format("TIRAKAN.Import.Success", { name: actor.name }));
      actor.sheet.render(true);
    } catch (error) {
      console.error(error);
      ui.notifications.error(game.i18n.format("TIRAKAN.Import.Failure", { message: error.message }));
    }
  }
}

export function buildApiUrl(source) {
  let url;
  try {
    url = new URL(source);
  } catch {
    throw new Error(game.i18n.localize("TIRAKAN.Import.InvalidUrl"));
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(game.i18n.localize("TIRAKAN.Import.InvalidUrl"));

  const hash = url.pathname.split("/").filter(Boolean).at(-1);
  if (!hash) throw new Error(game.i18n.localize("TIRAKAN.Import.NoHash"));

  const apiUrl = new URL(`/api/characters/${hash}`, url.origin);
  return { apiUrl: apiUrl.toString(), hash };
}

export function mapCharacterToActor(character, source, hash) {
  return {
    name: character.name || game.i18n.localize("TIRAKAN.Import.ImportedCharacter"),
    type: "character",
    system: {
      concept: character.concept ?? "",
      birthDate: character.birthDate ?? "",
      century: character.century ?? 1,
      campaign: character.campaign ?? "",
      playerName: character.playerName ?? "",
      ancestry: character.ancestry ?? "",
      ancestryCustom: Boolean(character.ancestryCustom),
      path: character.path ?? "",
      pathCustom: Boolean(character.pathCustom),
      bond: character.bond ?? "",
      bondCustom: Boolean(character.bondCustom),
      oathOrDebt: character.oathOrDebt ?? "",
      mark: character.mark ?? "keins",
      attributes: character.attributes ?? {},
      skills: character.skills ?? [],
      equipment: character.equipment ?? {},
      supernatural: character.supernatural ?? {},
      resources: {
        wounds: { value: character.conditions?.wounds ?? 0, max: character.woundThreshold ?? 3 },
        burden: { value: character.conditions?.burden ?? 0, max: character.burdenThreshold ?? 5 },
        omen: { value: character.conditions?.omen ?? character.omenMax ?? 0, max: character.omenMax ?? 0 },
        arkana: { value: character.conditions?.arkana ?? character.arkanaMax ?? 0, max: character.arkanaMax ?? 0 },
        favor: { value: character.conditions?.favor ?? character.favorMax ?? 0, max: character.favorMax ?? 0 }
      },
      notes: character.notes ?? "",
      source: {
        hash: character.hash ?? hash,
        url: source,
        importedAt: new Date().toISOString()
      }
    }
  };
}
