interface TG_Video {
     file_id: string; //	String 	Identifier for this file, which can be used to download or reuse the file
     file_unique_id: string; //	String 	Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     width: number; //	Integer 	Video width as defined by the sender
     height: number; //	Integer 	Video height as defined by the sender
     duration: number; //	Integer 	Duration of the video in seconds as defined by the sender
     thumbnail?: any; //	PhotoSize 	Optional. Video thumbnail
     cover?: any[]; // 	Array of PhotoSize 	Optional. Available sizes of the cover of the video in the message
     start_timestamp?: number; // 	Integer 	Optional. Timestamp in seconds from which the video will play in the message
     file_name?: string; //	String 	Optional. Original filename as defined by the sender
     mime_type?: string; // 	String 	Optional. MIME type of the file as defined by the sender
     file_size?: number; // 	Integer 	Optional. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
}

export default TG_Video;