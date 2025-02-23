export default  function splitMessage(text:string, maxLength:number, maxNewlines:number) {
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