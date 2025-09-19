import axios from "axios";
import { getTokenAdmin, getTokenByPageId } from "../getToken";

const BASE_URL = "https://graph.facebook.com/v23.0";

/**
 * Infos générales d’une page
 */
export async function getPageInfo(pageId: string) {

    const token = getTokenAdmin();
  try {
    const url = `${BASE_URL}/${pageId}?fields=id,name,about,fan_count,followers_count,category,emails,location,website,link,cover,picture&access_token=${token}`;
    console.log(url)
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log(error)
    console.error("Erreur getPageInfo:", error.response?.data || error.message);
    throw error;
  }
}
