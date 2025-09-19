import { talkToModel } from "./talkToModel";

/**
 * Génère un prompt publicitaire en fonction de la description d'une entreprise
 * @param description Description de l'entreprise (produits, domaine, etc.)
 * @param previousPrompts Chaîne contenant les 3 derniers prompts, séparés par des virgules
 */
export async function generatePrompt(
  description: string,
  previousPrompts: string
): Promise<string> {
  const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" });

  const systemInstruction = `
Tu es un assistant spécialisé en marketing créatif.
À partir de la description d'une entreprise, tu dois générer un prompt publicitaire
pour un visuel, en tenant compte :
- d'un produit parmi ceux proposés,
- uniquement des événements actuels ou à venir (dans 2 mois prochaines maximum),
- des tendances récentes.
Le prompt doit être clair et directement utilisable pour générer une image publicitaire en une seule phrase.
`;

  // Ajouter les prompts précédents si disponibles
  let previousPromptsText = "";
  if (previousPrompts) {
    previousPromptsText =
      "Voici les derniers prompts générés : " +
      previousPrompts +
      ". N'utilise plus les produits qui sont dans ces prompt sauf s'il n'y a plus.";
  }

  const userMessage = `
Nous sommes en ${currentMonth}.
Entreprise : ${description}
Dernier prompt a ne plus generer: ${previousPromptsText}
Tâche : Crée un prompt publicitaire adapté à un événement ou une tendance actuelle ou à venir.
Exemple attendu :
- "créer un visuel publicitaire pour une vente de gourde à l'occasion d'un événement actuel ou futur"
- "créer un visuel publicitaire pour une vente de chaise"
`;

  try {
    const prompt = await talkToModel(`${systemInstruction}\n${userMessage}`);
    return prompt;
  } catch (error) {
    console.error("Erreur generatePrompt:", error);
    throw new Error("Impossible de générer un prompt publicitaire");
  }
}
