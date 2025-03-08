import { botResponse, tgRequestMethod_t } from "../types/Types";



export default class TG_REQ{

     /**
      * Get the API URL for a given bot API and slug
      * @param botApiURL - full URL to the telegram API without slug ('https://api.telegram.org/bot' + token)
      * @param slug - slug to append to the API URL
      * @param data - data to append to the request
     */
     public static getApiUrl(botApiURL :string,slug:tgRequestMethod_t, data: Record<string, number | string | boolean>) {
          const request = new URL(botApiURL + (slug.startsWith('/') || botApiURL.endsWith('/') ? '' : '/') + slug);
          const params = new URLSearchParams();
          for (const i in data) {
               params.append(i, data[i].toString());
          }
          return new Request(`${request.toString()}?${params.toString()}`);
     } 

     
     public static tgApiUrl(token:string, methodName: tgRequestMethod_t, params: Record<string, any > = {}) {
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
     public static async tgSendRequest(token:string, method: tgRequestMethod_t,  params:Record<string, any >  ): Promise<botResponse> {
               try {
                    
                    
                    const response = await fetch(TG_REQ.tgApiUrl(token,method, params), {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' }
                    });
           
                    const data:botResponse = await response.json();
                    if (!data.ok) {
                       throw new Error(`Telegram API Error: ${data.description}`);
                    }
           
                    return data;
               } catch (error) {
                   console.error(`Error in ${method} request:`, error);
                   throw error;
               }
     }

     public static async callApi(token:string, methodName:tgRequestMethod_t, params?: Record<string, any>){
          try {
               if (params) {
               params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null));
               }
               const response = await fetch(TG_REQ.tgApiUrl(token, methodName, params),{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
               });
               const data: botResponse = await response.json();
               if (!data.ok) {
                    throw new Error(`Telegram API Error: ${data.description}`);
               } else {
                    console.log("debug from callApi- result: ", JSON.stringify(data.result))
                    return data.result;
               }
          } catch (error) {
               console.error(`Error in ${methodName} request:`, error);
               throw error;
           }
     }


}