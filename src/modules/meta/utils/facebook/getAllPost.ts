import axios from "axios";
import { getTokenByPageId } from "../getToken";

export async function getAllPost(pageId: string) {
  const token = getTokenByPageId(pageId);

  if (!token) {
    throw new Error(`Aucun token trouvé pour l'utilisateur ${pageId}`);
  }

  const url = `https://graph.facebook.com/v23.0/${pageId}/posts?access_token=${token}`;

  const response = await axios.get(url);

  return response.data;
}
