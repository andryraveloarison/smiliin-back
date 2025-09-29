// src/services/generatePrompt.ts
import { talkToModel } from "./talkToModel";
import { getUpcomingEvents, pickRandomThemeOrNull } from "./events";

export async function generatePrompt(
  description: string,
  previousPrompts: string
): Promise<string> {

  const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" });

  console.log("GO")
  // 1) Cherche les événements dans les 2 prochaines semaines
  const upcoming = getUpcomingEvents(14);

  const suggestedTheme = pickRandomThemeOrNull(upcoming, 0.28); // ~28% de chance de faire SANS thème

  const systemInstruction = `
Tu es un assistant spécialisé en marketing créatif.
À partir de la description d'une entreprise, tu dois générer un prompt publicitaire
pour un visuel, en tenant compte :
- d'un produit parmi ceux proposés,
- uniquement des événements actuels ou à venir (dans 2 mois prochaines maximum),
- des tendances récentes.
Le prompt doit être clair et directement utilisable pour générer une image publicitaire en une seule phrase.
`;

  let previousPromptsText = "";
  if (previousPrompts) {
    previousPromptsText =
      "Voici les derniers prompts générés : " +
      previousPrompts +
      ". N'utilise plus les produits qui sont dans ces prompt sauf s'il n'y a plus.";
  }

  // 2) Prépare un hint de thème (ou rien si null)
  const themeHint = suggestedTheme
    ? `Thème suggéré (optionnel) : "${suggestedTheme.name}" (${suggestedTheme.type}, ${suggestedTheme.date}).`
    : "Aucun thème imposé (libre).";

  const userMessage = `
Nous sommes en ${currentMonth}.
${themeHint}
Entreprise : ${description}
Dernier prompt a ne plus generer: ${previousPromptsText}
Tâche : Crée un prompt publicitaire adapté à un événement ou une tendance actuelle ou à venir en basant par la description de l'entreprise et ce qu'il peut vendre et/ou par le theme.
Exemple attendu :
- "créer un visuel publicitaire pour une vente de gourde à l'occasion d'un événement actuel ou futur"
- "créer un visuel publicitaire pour une vente de chaise"
`;

console.log(userMessage)

return
  try {
    const prompt = await talkToModel(`${systemInstruction}\n${userMessage}`);
    return prompt;
  } catch (error) {
    console.error("Erreur generatePrompt:", error);
    throw new Error("Impossible de générer un prompt publicitaire");
  }
}
