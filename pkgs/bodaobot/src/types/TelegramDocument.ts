import TelegramPhotoSize from './TelegramPhotoSize.js';

export interface TelegramDocument {
	file_name: string;
	mime_type: string;
	thumbnail: TelegramPhotoSize;
	thumb?:TelegramPhotoSize;
	file_id: string;
	file_unique_id: string;
	file_size: number;
}

/*
"document": {
            "file_name": "aniversarios.pdf",
            "mime_type": "application/pdf",
            "thumbnail": {
              "file_id": "AAMCAQADIQUABIdh1RkAAgFHZ8Q_bmq-YQ9mrtJLDBsLys7FzdsAAm4FAAL9USFGHzenf5iDZtABAAdtAAM2BA",
              "file_unique_id": "AQADbgUAAv1RIUZy",
              "file_size": 23602,
              "width": 226,
              "height": 320
            },
            "thumb": {
              "file_id": "AAMCAQADIQUABIdh1RkAAgFHZ8Q_bmq-YQ9mrtJLDBsLys7FzdsAAm4FAAL9USFGHzenf5iDZtABAAdtAAM2BA",
              "file_unique_id": "AQADbgUAAv1RIUZy",
              "file_size": 23602,
              "width": 226,
              "height": 320
            },
            "file_id": "BQACAgEAAyEFAASHYdUZAAIBR2fEP25qvmEPZq7SSwwbC8rOxc3bAAJuBQAC_VEhRh83p3-Yg2bQNgQ",
            "file_unique_id": "AgADbgUAAv1RIUY",
            "file_size": 35562
          },
*/