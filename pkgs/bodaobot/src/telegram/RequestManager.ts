import TG_BOT from "../telegram_bot";
import { botResponse, tgRequestMethod_t } from "../types/Types";



export default class TG_REQ{

private static getToken():string{
     return TG_BOT.token;
}


     /**
      * Get the API URL for a given bot API and slug
      * @param botApiURL - full URL to the telegram API without slug ('https://api.telegram.org/bot' + token)
      * @param slug - slug to append to the API URL
      * @param data - data to append to the request
     */
     public static getApiUrl(slug:tgRequestMethod_t, data: Record<string, number | string | boolean>) {
          const botApiURL: string = TG_BOT.api.toString();
          const request = new URL(botApiURL + (slug.startsWith('/') || botApiURL.endsWith('/') ? '' : '/') + slug);
          const params = new URLSearchParams();
          for (const i in data) {
               params.append(i, data[i].toString());
          }
          return new Request(`${request.toString()}?${params.toString()}`);
     } 

     public static apiUrl(methodName: string, params?: Record<string, any>) {
          const token = TG_REQ.getToken();
          const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      
          return `https://api.telegram.org/bot${token}/${methodName}${query}`;
     }

     public static tgApiUrl(methodName: tgRequestMethod_t, params: Record<string, any > = {}) {
          const token:string = TG_REQ.getToken();
          const api = new URL('https://api.telegram.org/bot' + token);
          const query = params ? `?${new URLSearchParams(params).toString()}` : '';
          return api+`/${methodName}${query}`;
     }

     /**
      * Send quest to Telegram Bot API
      * @param method the request method ('sendMediaGroup','sendMessage','deleteMessage','answerCallbackQuery',)
      * @param params the params to append to the request
      * @returns the params appended to the request JSON formated
      */
     public static async tgSendRequest(method: tgRequestMethod_t,  params:Record<string, any >  ): Promise<botResponse> {
               try {
                    const token:string = TG_REQ.getToken();
                    //const response = await fetch(TG_REQ.tgApiUrl(method, token, params), {
                    const response = await fetch(TG_REQ.tgApiUrl(method, params), {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' }
                    });
           
                    const data:any = await response.json();
                    if (!data.ok) {
                       throw new Error(`Telegram API Error: ${data.description}`);
                    }
           
                    return data;
               } catch (error) {
                   console.error(`Error in ${method} request:`, error);
                   throw error;
               }
     }

     public static async callApi(methodName: string, params?: Record<string, any>){
          if (params) {
              params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null));
          }
          const response: botResponse = await (await fetch(TG_REQ.apiUrl(methodName, params))).json();
          if (!response.ok) {
              throw new Error('API Call Failed:\n' + JSON.stringify(response, null, 2));
          } else {
              return response.result;
          }
     }


}