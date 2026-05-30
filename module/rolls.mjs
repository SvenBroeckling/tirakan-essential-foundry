import { TIRAKAN } from "./config.mjs";

const RESULT_LABELS = {
  criticalSuccess: "TIRAKAN.Roll.CriticalSuccess",
  strongSuccess: "TIRAKAN.Roll.StrongSuccess",
  cleanSuccess: "TIRAKAN.Roll.CleanSuccess",
  narrowSuccess: "TIRAKAN.Roll.NarrowSuccess",
  narrowFailure: "TIRAKAN.Roll.NarrowFailure",
  clearFailure: "TIRAKAN.Roll.ClearFailure",
  severeFailure: "TIRAKAN.Roll.SevereFailure",
  catastrophe: "TIRAKAN.Roll.Catastrophe"
};

export function clampTarget(value) {
  return Math.clamp(Number(value) || 0, 5, 95);
}

export function attributeTarget(attributeValue, modifier = 0) {
  return clampTarget(30 + (Number(attributeValue) || 0) * 10 + (Number(modifier) || 0));
}

export function evaluateCheck({ total, target, skillRank = 1 }) {
  const roll = Number(total);
  const targetValue = Number(target);
  const margin = targetValue - roll;
  const success = roll < targetValue;
  let resultKey;
  let consequence = "none";

  if (success && roll >= 1 && roll <= 5) resultKey = "criticalSuccess";
  else if (!success && roll >= 96) resultKey = "catastrophe";
  else if (success && margin >= 30) resultKey = "strongSuccess";
  else if (success && margin >= 10) resultKey = "cleanSuccess";
  else if (success) resultKey = "narrowSuccess";
  else if (Math.abs(margin) <= 9) resultKey = "narrowFailure";
  else if (Math.abs(margin) <= 29) resultKey = "clearFailure";
  else resultKey = "severeFailure";

  if (resultKey === "narrowFailure") consequence = Number(skillRank) >= 1 ? "none" : "minor";
  if (resultKey === "clearFailure") consequence = "serious";
  if (resultKey === "severeFailure" || resultKey === "catastrophe") consequence = "critical";
  if (!success && Number(skillRank) <= 0) consequence = increaseConsequence(consequence);

  return {
    roll,
    target: targetValue,
    margin,
    success,
    resultKey,
    resultLabel: RESULT_LABELS[resultKey],
    consequence
  };
}

export function increaseConsequence(level) {
  if (level === "none") return "minor";
  if (level === "minor") return "serious";
  return "critical";
}

export async function rollCheck(actor, { attribute, skillName = "", skillRank = 1, modifier = 0, flavor = "" } = {}) {
  const attributeValue = actor.system.attributes?.[attribute] ?? 0;
  const target = attributeTarget(attributeValue, modifier);
  const roll = await new Roll("1d100").evaluate();
  const result = evaluateCheck({ total: roll.total, target, skillRank });
  const attributeLabel = localizeAttribute(attribute);
  const consequenceLabel = game.i18n.localize(`TIRAKAN.Consequence.${result.consequence}`);

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: await renderTemplate("systems/tirakan-essential-foundry/templates/chat/check-result.hbs", {
      actor,
      attribute,
      attributeLabel,
      skillName,
      skillRank,
      modifier,
      target,
      flavor,
      result,
      resultText: game.i18n.localize(result.resultLabel),
      consequenceLabel
    })
  });

  return result;
}

export function localizeAttribute(attribute) {
  const entry = TIRAKAN.attributes.find((item) => item.key === attribute);
  if (!entry) return attribute;
  return game.i18n.lang === "de" ? entry.de : entry.en;
}
