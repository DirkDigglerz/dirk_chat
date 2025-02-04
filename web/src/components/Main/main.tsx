import { BackgroundImage, Flex, MantineColor, MantineColorShade, MantineColorsTuple } from "@mantine/core"
import { useEffect } from "react"
import { useNuiEvent } from "../../hooks/useNuiEvent"
import useSettings from "../../providers/settings"
import { fetchNui } from "../../utils/fetchNui"
import { isEnvBrowser } from "../../utils/misc"
import InputBar from "./InputBar"
import Messages from "./Messages"
import useChat, { CommandProps, MessageProps, UserSettingsProps } from "./store"



export default function Main() {

  // listen for excape key 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useChat.setState({ open: false })
        fetchNui('CHAT_CLOSED')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown  ) 
  }, [])

  useNuiEvent<CommandProps>('ADD_COMMAND', (data) => {
    console.log('ADD_COMMAND', JSON.stringify(data))
    useChat.setState((state) => ({
      commands: [
        ...state.commands,
        data
      ]
    }))
  })

  useNuiEvent('CLEAR_CHAT', () => {
    useChat.setState({
      messages: []
    })
  })


  useNuiEvent('REMOVE_COMMAND', (data) => {
    const commandName = data as unknown as string
    useChat.setState({
      commands: useChat.getState().commands.filter(command => command.name !== commandName)
    })
  })

  useNuiEvent('ADD_MESSAGE', (data: {
    message: MessageProps
  }) => {  
    const message = data.message
    useChat.setState({
      messages: [
        ...useChat.getState().messages,
        message
      ]
    })
  })

  useNuiEvent<{
    display: boolean;
    registeredCommands: CommandProps[];
  }>('TOGGLE_CHAT', (data: {
    display: boolean;
    registeredCommands: CommandProps[];
  }) => {
    useChat.setState({ open: data.display })
    useChat.setState({ commands: data.registeredCommands })
  })

  useEffect(() => {
    fetchNui<{
      settings: UserSettingsProps
      primaryColor: MantineColor;
      primaryShade: MantineColorShade;
      customTheme: MantineColorsTuple;
    }>('GET_SETTINGS').then((data) => {
      useSettings.setState({
        primaryColor: data.primaryColor,
        primaryShade: data.primaryShade,
        customTheme: data.customTheme,
        
      })
      useChat.setState({
        settings: data.settings
      })
    })
  }, [])

  
  return (
    <Wrapper>
      <Flex
        direction='column'
        pos='absolute'
        m='xs'
        left={'0'}
        w='45vh'
        h='25vh'
        gap='xs'

        style={{
          transition: 'all 0.5s ease-in-out',
        }}
      >
        <Messages/>
        <InputBar/>

      </Flex>
    </Wrapper>
  )
}



function Wrapper({ children }: { children: React.ReactNode }) {
  return isEnvBrowser() ? ( 
    <BackgroundImage w='100vw' h='100vh' style={{overflow:'hidden'}}
      src="https://i.ytimg.com/vi/TOxuNbXrO28/maxresdefault.jpg"
    >  
      {children}
    </BackgroundImage>
  ) : (
    <>{children}</>
  )
}
