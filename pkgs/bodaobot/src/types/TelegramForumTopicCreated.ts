
/**
 * This object represents a service message about a new forum topic created in the chat.
 */
interface TG_ForumTopicCreated{


name: string; // 	String 	Name of the topic
icon_color:number; // 	Integer 	Color of the topic icon in RGB format
icon_custom_emoji_id?:string // 	String 	Optional. Unique identifier of the custom emoji shown as the topic icon
};

export default TG_ForumTopicCreated