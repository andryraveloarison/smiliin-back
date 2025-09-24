import axios from "axios";
import { getTokenAdmin, getTokenByPageId } from "../getToken";

const BASE_URL = "https://graph.facebook.com/v23.0/";

/**
 * Infos générales d’une page
 */
export async function getPageInsights(pageId: string, period: string) {

  period = "since=2025-09-01&until=2025-09-29"
  const token = getTokenByPageId(pageId);

  const URL = BASE_URL + pageId + "/insights?metric=page_impressions_unique,page_fan_adds,page_views_total,page_post_engagements,page_media_view,page_messages_new_conversations_unique&period=day&"+period+"&access_token="+token


  try {
    const url = `${URL}`;
    console.log("*******")
    console.log(url)
    console.log("*******")

    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log(error)
    console.error("Erreur getPageInfo:", error.response?.data || error.message);
    throw error;
  }
}
