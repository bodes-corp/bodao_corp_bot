import TG_ExecutionContext from "./telegram_execution_context";

export function splitMessage(text:string, maxLength:number, maxNewlines:number) {
	const parts = [];
	while (text.length > 0) {
	    let part = text.substring(0, maxLength);
 
	    if (!part.endsWith("\n")) {
		   const lastNewlineIndex = part.lastIndexOf("\n");
		   if (lastNewlineIndex !== -1) {
			  part = part.substring(0, lastNewlineIndex + 1);
		   }
	    }
 
	    const newlineCount = (part.match(/\n/g) || []).length;
	    if (newlineCount >= maxNewlines) {
		   const splitIndex = part.lastIndexOf("\n") + 1;
		   parts.push(part.substring(0, splitIndex));
		   text = text.substring(splitIndex);
	    } else {
		   parts.push(part);
		   text = text.substring(part.length);
	    }
	}
	return parts;
 }

 export function checkTD(ctx:TG_ExecutionContext):Promise<boolean>{
  if (!ctx) return Promise.resolve(false);
    const msg_txt = ctx.update.message?.text
    if(!msg_txt) return Promise.resolve(false);
	  const keywords = ["Rosto", "Peitos", "Bunda", "Corpo", "Beij", "Massagem", "Oral", "Transa", "Anal", "Presença", "Valor", "Data"];
	  return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? Promise.resolve(true) : Promise.resolve(false);
 }
         
 export async function  checkRP(ctx:TG_ExecutionContext):Promise<boolean>{
  if (!ctx) return Promise.resolve(false);
  const msg_txt = ctx.update.message?.text
  if(!msg_txt) return Promise.resolve(false);
	const keywords = ["01) Mudou aparência", "02) Mudou atend", "03) Livre", "04) Valor", "05) Clínica"];
	return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? Promise.resolve(true) : Promise.resolve(false);
 }

export function isValidChat(message:any , chat_id:string ) {
     return message.chat_id === parseInt(chat_id);
}

export function isValidSearchTerm(name:any ) {
    return name.length >= 3;
}


export function sleep(ms:any) {
     return new Promise(resolve => setTimeout(resolve, ms));
 }
 
export function removeAccents(str:string) {
     if (!str) return '';
     return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
 }
 
export function chunkArray(array:any, size:number) {
     return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
         array.slice(i * size, i * size + size)
     );
 }

 export  function stringToWordsArray(inputString:string) {
     // Remove symbols ( ) /
     const sanitizedString = inputString.replace(/[()\/-]/g, ' ');
     // Replace accented characters with _
     const stringWithoutAccents = sanitizedString.replace(/[ãÃáÁéÉíÍóÓúÚ]/g, '_');
     // Split the sanitized string into an array of words
     const resultArray = stringWithoutAccents.split(/\s+/);
  
     return resultArray;
  }

export  function formatDate(unixTimestamp:number ) {
     const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
   
     const options:any = {
         day: '2-digit',
         month: '2-digit',
         year: '2-digit',
         timeZone: 'America/Sao_Paulo', // Brazil time zone
     };
       
     const formatter = new Intl.DateTimeFormat('en-US', options);
     const parts = formatter.formatToParts(date);
       
     const formattedDate = `${parts[2].value}/${parts[0].value}/${parts[4].value}`;
     return formattedDate;
 }

 interface Mapping {
    string: string
    number: number
    bigint: bigint
    boolean: boolean
    symbol: symbol
    undefined: undefined
    object: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function: (...props: any[]) => any
  }
  
  /**
   * Checks if a given object has a property with a given name.
   *
   * Example invocation:
   * ```js
   * let obj = { 'foo': 'bar', 'baz': () => {} }
   * hasProp(obj, 'foo') // true
   * hasProp(obj, 'baz') // true
   * hasProp(obj, 'abc') // false
   * ```
   *
   * @param obj An object to test
   * @param prop The name of the property
   */
  export function hasProp<O extends object, K extends PropertyKey>(
    obj: O | undefined,
    prop: K
  ): obj is O & Record<K, unknown> {
    return obj !== undefined && prop in obj
  }
  /**
   * Checks if a given object has a property with a given name.
   * Furthermore performs a `typeof` check on the property if it exists.
   *
   * Example invocation:
   * ```js
   * let obj = { 'foo': 'bar', 'baz': () => {} }
   * hasPropType(obj, 'foo', 'string') // true
   * hasPropType(obj, 'baz', 'function') // true
   * hasPropType(obj, 'abc', 'number') // false
   * ```
   *
   * @param obj An object to test
   * @param prop The name of the property
   * @param type The type the property is expected to have
   */
  export function hasPropType<
    O extends object,
    K extends PropertyKey,
    T extends keyof Mapping,
    V extends Mapping[T],
  >(obj: O | undefined, prop: K, type: T): obj is O & Record<K, V> {
    return hasProp(obj, prop) && type === typeof obj[prop]
  }
  
  /**
   * Checks if the supplied array has two dimensions or not.
   *
   * Example invocations:
   * is2D([]) // false
   * is2D([[]]) // true
   * is2D([[], []]) // true
   * is2D([42]) // false
   *
   * @param arr an array with one or two dimensions
   */
  export function is2D<E>(arr: E[] | E[][]): arr is E[][] {
    return Array.isArray(arr[0])
  }
  