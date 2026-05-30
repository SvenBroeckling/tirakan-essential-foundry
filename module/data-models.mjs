const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

function resourceField(initial = 0, max = 0) {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, initial, min: 0 }),
    max: new NumberField({ required: true, integer: true, initial: max, min: 0 })
  });
}

function attributesField() {
  return new SchemaField({
    mind: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    will: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    instinct: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    dexterity: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    body: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    presence: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    gift: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    perception: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 })
  });
}

function skillsField() {
  return new ArrayField(new SchemaField({
    name: new StringField({ required: true, blank: true, initial: "" }),
    rank: new NumberField({ required: true, integer: true, initial: 0, min: 0, max: 4 }),
    usedReroll: new BooleanField({ required: true, initial: false }),
    usedIgnore: new BooleanField({ required: true, initial: false })
  }));
}

class BaseActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      concept: new StringField({ required: true, blank: true, initial: "" }),
      biography: new HTMLField({ required: true, blank: true }),
      notes: new HTMLField({ required: true, blank: true }),
      attributes: attributesField(),
      skills: skillsField(),
      resources: new SchemaField({
        wounds: resourceField(0, 3),
        burden: resourceField(0, 5),
        omen: resourceField(0, 2),
        arkana: resourceField(0, 3),
        favor: resourceField(0, 3)
      }),
      conditions: new ArrayField(new StringField({ required: true, blank: true, initial: "" })),
      derived: new SchemaField({
        woundThreshold: new NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        burdenThreshold: new NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        initiative: new NumberField({ required: true, integer: true, initial: 30 }),
        faithLevel: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        magicLevel: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        invocationValue: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        favorLimit: new NumberField({ required: true, integer: true, initial: 1, min: 0 })
      })
    };
  }
}

export class CharacterDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      birthDate: new StringField({ required: true, blank: true, initial: "" }),
      century: new NumberField({ required: true, integer: true, initial: 1, min: 1, max: 10 }),
      campaign: new StringField({ required: true, blank: true, initial: "" }),
      playerName: new StringField({ required: true, blank: true, initial: "" }),
      ancestry: new StringField({ required: true, blank: true, initial: "" }),
      ancestryCustom: new BooleanField({ required: true, initial: false }),
      path: new StringField({ required: true, blank: true, initial: "" }),
      pathCustom: new BooleanField({ required: true, initial: false }),
      bond: new StringField({ required: true, blank: true, initial: "" }),
      bondCustom: new BooleanField({ required: true, initial: false }),
      oathOrDebt: new StringField({ required: true, blank: true, initial: "" }),
      mark: new StringField({ required: true, blank: true, initial: "keins" }),
      equipment: new ObjectField({ required: true, initial: {} }),
      supernatural: new ObjectField({ required: true, initial: {} }),
      source: new SchemaField({
        hash: new StringField({ required: true, blank: true, initial: "" }),
        url: new StringField({ required: true, blank: true, initial: "" }),
        importedAt: new StringField({ required: true, blank: true, initial: "" })
      })
    };
  }
}

export class NscDataModel extends BaseActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      role: new StringField({ required: true, blank: true, initial: "" }),
      instinct: new StringField({ required: true, blank: true, initial: "" }),
      tactics: new HTMLField({ required: true, blank: true }),
      equipment: new ObjectField({ required: true, initial: {} })
    };
  }
}

class BaseItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true })
    };
  }
}

export class WeaponDataModel extends BaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      damage: new StringField({ required: true, blank: true, initial: "1" }),
      range: new StringField({ required: true, blank: true, initial: "Nahkampf" }),
      grip: new StringField({ required: true, blank: true, initial: "0" }),
      properties: new StringField({ required: true, blank: true, initial: "" })
    };
  }
}

export class ArmorDataModel extends BaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      protection: new StringField({ required: true, blank: true, initial: "0" }),
      load: new StringField({ required: true, blank: true, initial: "0" }),
      sealing: new StringField({ required: true, blank: true, initial: "0" }),
      properties: new StringField({ required: true, blank: true, initial: "" })
    };
  }
}

export class GearDataModel extends BaseItemDataModel {}

export class SpellDataModel extends BaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      aspect: new StringField({ required: true, blank: true, initial: "" }),
      category: new StringField({ required: true, blank: true, initial: "" }),
      element: new StringField({ required: true, blank: true, initial: "" }),
      cost: new StringField({ required: true, blank: true, initial: "" }),
      range: new StringField({ required: true, blank: true, initial: "" }),
      duration: new StringField({ required: true, blank: true, initial: "" }),
      resisted: new StringField({ required: true, blank: true, initial: "" })
    };
  }
}
