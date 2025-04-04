import { Hideable } from "../../types/Types"
import {
  InlineKeyboardButton,
  KeyboardButton,
  KeyboardButtonRequestChat,
  KeyboardButtonRequestUsers
} from "../types/markup"


   
export function text(
     text: string,
     hide = false
   ): Hideable<KeyboardButton.Common> {
     return { text, hide }
}
   
   export function contactRequest(
     text: string,
     hide = false
   ): Hideable<KeyboardButton.RequestContact> {
     return { text, request_contact: true, hide }
   }
   
   export function locationRequest(
     text: string,
     hide = false
   ): Hideable<KeyboardButton.RequestLocation> {
     return { text, request_location: true, hide }
   }
   
   export function pollRequest(
     text: string,
     type?: 'quiz' | 'regular',
     hide = false
   ): Hideable<KeyboardButton.RequestPoll> {
     return { text, request_poll: { type }, hide }
   }
   
   export function userRequest(
     text: string,
     /** Must fit in a signed 32 bit int */
     request_id: number,
     extra?: Omit<KeyboardButtonRequestUsers, 'request_id' | 'text'>,
     hide = false
   ): Hideable<KeyboardButton.RequestUsers> {
     return {
       text,
       request_users: { request_id, ...extra },
       hide,
     }
   }
   
   export function botRequest(
     text: string,
     /** Must fit in a signed 32 bit int */
     request_id: number,
     extra?: Omit<
       KeyboardButtonRequestUsers,
       'request_id' | 'user_is_bot' | 'text'
     >,
     hide = false
   ): Hideable<KeyboardButton.RequestUsers> {
     return {
       text,
       request_users: { request_id, user_is_bot: true, ...extra },
       hide,
     }
   }
   
   type KeyboardButtonRequestGroup = Omit<
     KeyboardButtonRequestChat,
     'request_id' | 'chat_is_channel'
   >
   
   export function groupRequest(
     text: string,
     /** Must fit in a signed 32 bit int */
     request_id: number,
     extra?: KeyboardButtonRequestGroup,
     hide = false
   ): Hideable<KeyboardButton.RequestChat> {
     return {
       text,
       request_chat: { request_id, chat_is_channel: false, ...extra },
       hide,
     }
   }
   
   type KeyboardButtonRequestChannel = Omit<
     KeyboardButtonRequestChat,
     'request_id' | 'chat_is_channel' | 'chat_is_forum'
   >
   
   export function channelRequest(
     text: string,
     /** Must fit in a signed 32 bit int */
     request_id: number,
     extra?: KeyboardButtonRequestChannel,
     hide = false
   ): Hideable<KeyboardButton.RequestChat> {
     return {
       text,
       request_chat: { request_id, chat_is_channel: true, ...extra },
       hide,
     }
   }
   
   export function url(
     text: string,
     url: string,
     hide = false
   ): Hideable<InlineKeyboardButton.UrlButton> {
     return { text, url, hide }
   }
   
   export function callback(
     text: string,
     data: string,
     hide = false
   ): Hideable<InlineKeyboardButton.CallbackButton> {
     return { text, callback_data: data, hide }
   }
   
   export function switchToChat(
     text: string,
     value: string,
     hide = false
   ): Hideable<InlineKeyboardButton.SwitchInlineButton> {
     return { text, switch_inline_query: value, hide }
   }
   
   export function switchToCurrentChat(
     text: string,
     value: string,
     hide = false
   ): Hideable<InlineKeyboardButton.SwitchInlineCurrentChatButton> {
     return { text, switch_inline_query_current_chat: value, hide }
   }
   
   export function game(
     text: string,
     hide = false
   ): Hideable<InlineKeyboardButton.GameButton> {
     return { text, callback_game: {}, hide }
   }
   
   export function pay(
     text: string,
     hide = false
   ): Hideable<InlineKeyboardButton.PayButton> {
     return { text, pay: true, hide }
   }
   
   export function login(
     text: string,
     url: string,
     opts: {
       forward_text?: string
       bot_username?: string
       request_write_access?: boolean
     } = {},
     hide = false
   ): Hideable<InlineKeyboardButton.LoginButton> {
     return {
       text,
       login_url: { ...opts, url },
       hide,
     }
   }
   
   export function webApp(
     text: string,
     url: string,
     hide = false
     // works as both InlineKeyboardButton and KeyboardButton
   ): Hideable<InlineKeyboardButton.WebAppButton> {
     return {
       text,
       web_app: { url },
       hide,
     }
   }
   