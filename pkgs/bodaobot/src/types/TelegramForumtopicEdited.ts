/**
 * This object represents a service message about an edited forum topic.
 */
interface TG_ForumTopicEdited {
     name?: string;// 	String 	Optional. New name of the topic, if it was edited
     icon_custom_emoji_id?: string;// 	String 	Optional. New identifier of the custom emoji shown as the topic icon, if it was edited; an empty string if the icon was removed
     
}

export default TG_ForumTopicEdited;