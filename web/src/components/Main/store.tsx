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
  helpText: string;
}

export type CommandProps = {
  name: string;
  helpText: string;
  params: ParamProps[];
}

export type UserSettingsProps = {
  hide: 'always' | 'never' | 'auto'; // Auto will hide the chat after a certain amount of time
  hideTimeout: number; // Time in ms to hide the chat
  sounds: boolean; // Play sounds on message
  
}

export type ChatProps = {
  open: boolean;
  currentInput: string;
  commands: CommandProps[];
  messages: MessageProps[];
  settings: UserSettingsProps;
}



const useChat = create<ChatProps>(() => ({
  open: isEnvBrowser(),
  currentInput: '',
  settings: {
    hide: 'auto',
    hideTimeout: 5000,  
    sounds: true
  },
  messages: [
    {
      text: 'Welcome to the chat!',
      author: 'system',
      tags: [
        {
          text: 'system',
          color: 'red'
        },
        {
          text: 'tweet',
          icon: 'fab fa-twitter',
          color: 'blue'
        }
      ]

    }
  ],
  commands: [
    {
      name: 'help',
      helpText: 'print help message',
      params: [
        {
          name: 'command',
          helpText: 'command to get help for'
        }
      ]
    },
    {
      name: 'clear',
      helpText: 'clear all messages',
      params: []
    }
  ]
}));

export default useChat;