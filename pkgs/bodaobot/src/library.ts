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

 export function checkTD(msg_txt:string) {
	const keywords = ["Rosto", "Peitos", "Bunda", "Corpo", "Beij", "Massagem", "Oral", "Transa", "Anal", "Presença", "Valor", "Data"];
	return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? 1 : 0;
 }
 
 export function checkRP(msg_txt:string) {
	const keywords = ["01) Mudou aparência", "02) Mudou atend", "03) Livre", "04) Valor", "05) Clínica"];
	return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? 1 : 0;
 }

export function isValidChat(message:any , env:any ) {
     return message.chat_id === parseInt(env.TG_CHATID);
}

export function isValidSearchTerm(name:any ) {
    return name.length >= 3;
}


export function sleep(ms:any) {
     return new Promise(resolve => setTimeout(resolve, ms));
 }
 
export function removeAccents(str:string) {
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
  