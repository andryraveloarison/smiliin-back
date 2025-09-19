import axios from "axios";
import { getTokenAdmin } from "../getToken";

const BASE_URL = "https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token&access_token=";
/**
 * Infos générales d’une page
 */
export async function getAllPage() {

    const token = getTokenAdmin();
  try {
    const url = `${BASE_URL}${token}`;
    console.log(url)
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log(error)
    console.error("Erreur getPageInfo:", error.response?.data || error.message);
    throw error;
  }
}
