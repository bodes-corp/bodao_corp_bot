import { botResponse, tgRequestMethod_t } from "../types/Types";



export default class TG_REQ{

     /**
           * set an indefinite timeout
           * In this case, the timeoutPromise is an empty Promise 
           * that never rejects. Therefore, the fetchPromise will continue indefinitely until it resolves or encounters an error.
           */
     static timeoutPromise2 = new Promise((resolve, reject) => {});

     /**
      * In the example above, we create a timeoutPromise that will reject after the specified 
      * time (3 seconds in this case). 
      * Then, using Promise.race(), we can wait until either the Fetch API 
      * request or the timeout promise is settled. Whichever settles first 
      * will determine the outcome.
      */
     static timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Request timed out')) // reject the promise after 3 seconds
          }, 3000) //3 seconds
        });

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
               const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                      reject(new Error('Request timed out')) // reject the promise after 3 seconds
                    }, 3000) //3 seconds
                  });
                    
                    const apiUrl = TG_REQ.tgApiUrl(token,method, params);
                    console.log('debug from tgSendRequest - apiURL: ',apiUrl)
                    const fetchPromise = fetch(apiUrl, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' }
                    })

                    const response:any = await Promise.race([fetchPromise, timeoutPromise])
                    // handle the successful fetch response
                    console.log('debug from tgSendRequest - return from fetch: ', JSON.stringify(response))
                    const data:any = await response.json();
                    if (!data.ok) {
                         throw new Error(`Telegram API Error: ${data.description}`);
                    }
                
                    return Promise.resolve(data);
                       
                       
                    //const response = await fetch(apiUrl, {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' }
                   // });
                    
                    
               } catch (error) {
                   console.error(`Error in ${method} request:`, error);
                   throw error;
               }
     }

     public static async callApi(token:string, methodName:tgRequestMethod_t, params?: Record<string, any>): Promise<any> {
          try {
               const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                      reject(new Error('Request timed out')) // reject the promise after 3 seconds
                    }, 3000) //3 seconds
                  });

               if (params) {
               params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null));
               }
               console.log('[debug from callApi] response params:', JSON.stringify(params));
               
               const fetchPromise = fetch(TG_REQ.tgApiUrl(token, methodName, params),{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
               });

               const response:any = await Promise.race([fetchPromise, timeoutPromise]);
               
               //const response = await fetch(TG_REQ.tgApiUrl(token, methodName, params),{
               //     method: 'POST',
               //      headers: { 'Content-Type': 'application/json' }
               //});
               if(response) {
                    console.log('[debug from callApi] returned from fetch: response: ', JSON.stringify(response));
                    const data: botResponse = await response.json();
                    console.log('[debug from callApi] response data:', JSON.stringify(data));
                    if (!data.ok) {
                         throw new Error(`Telegram API Error: ${data.description}`);
                    } else {
                         console.log("debug from callApi- result: ", JSON.stringify(data.result))
                         return await data.result;
                    }
               }else {
                    console.error(`Error in ${methodName} response not received`);
                    throw new Error(`Telegram API Error:response not received`);
               }
               
          } catch (error) {
               console.error(`Error in ${methodName} request:`, error);
               throw error;
           }
     }


}