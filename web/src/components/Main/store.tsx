import { create } from "zustand";
import { isEnvBrowser } from "../../utils/misc";



export type MessageTags = {
  icon?: string;
  text: string;
  color: string;
}

export type MessageProps = {
  text: string;
  tags?: MessageTags[];
  
}

export type ParamProps = {
  name: string; 
  help: string;
}

export type CommandProps = {
  name: string;
  help?: string;
  params?: ParamProps[];
}

export type UserSettingsProps = {
  position: 'left' | 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left';
  hide: 'always' | 'never' | 'auto'; // Auto will hide the chat after a certain amount of time
  hideTimeout: number; // Time in ms to hide the chat
  commandOnly?: boolean;
  sounds: boolean; // Play sounds on message
  
}

export type ChatProps = {
  open: boolean;
  currentInput: string;
  commands: CommandProps[];
  messages: MessageProps[];
  settings: UserSettingsProps;
};



const useChat = create<ChatProps>(() => ({
  open: isEnvBrowser(),

  currentInput: '',
  settings: {
    position: 'top',
    hide: 'auto',
    hideTimeout: 5000,  
    sounds: false,
    commandOnly: true,
  },
  messages: [],
  commands: [
    {
      name: 'help',
      help: 'print help message',
      params: [
        {
          name: 'command',
          help: 'command to get help for'
        },
        {
          name: 'subcommand',
          help: 'subcommand to get help for'
        }
      ]
    },
    {
      name: 'clear',
      help: 'clear all messages',
      params: []
    }
  ]
}));

export default useChat;