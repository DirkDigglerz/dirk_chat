import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Flex, Text, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAudioPlayerStore } from "../../providers/audio/audio"
import colorWithAlpha from "../../utils/colorWithAlpha"
import { fetchNui } from "../../utils/fetchNui"
import { isEnvBrowser } from "../../utils/misc"
import SettingsMenu from "./SettingsMenu"
import useChat, { CommandProps } from "./store"

type InputButtonProps = {
  icon: string;
  inUse?: boolean;
  onClick: () => void;
}

function InputButton(props: InputButtonProps) {
  const {ref, hovered} = useHover()
  const theme = useMantineTheme()
  return (
    <FontAwesomeIcon 
      ref={ref}
      icon={props.icon as IconProp} 
      style={{
        fontSize: theme.fontSizes.xs,
        transition: 'all 0.1s ease-in-out',
        marginRight: theme.spacing.xs,
        cursor: 'pointer',
        color: hovered || props.inUse ? colorWithAlpha(theme.colors[theme.primaryColor][9], 0.6) : 'rgba(255,255,255,0.5)' 
      }}
      onClick={props.onClick}
    />
  )
}

function InputBar() {
  const open = useChat((state) => state.open);
  const settings = useChat((state) => state.settings);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [prevSentMessages, setPrevSentMessages] = useState<string[]>([]);
  const [prevSentMessageIndex, setPrevSentMessageIndex] = useState<number | null>(null);
  const currentInput = useChat((state) => state.currentInput);
  const theme = useMantineTheme();
  const inputRef = useRef<HTMLInputElement | null>(null); // Reference for the input

  // if the open goes to false close Settingsopen 
  useEffect(() => {
    if (!open) {
      setSettingsOpen(false)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (prevSentMessages.length === 0) return;
      if (e.key === "ArrowUp") {
        const newIndex =
          prevSentMessageIndex === null
            ? prevSentMessages.length - 1
            : Math.max(prevSentMessageIndex - 1, 0);
        setPrevSentMessageIndex(newIndex);
        useChat.setState({ currentInput: prevSentMessages[newIndex] });
      } else if (e.key === "ArrowDown") {
        if (prevSentMessageIndex === null) return;
        const newIndex = Math.min(prevSentMessageIndex + 1, prevSentMessages.length - 1);
        setPrevSentMessageIndex(newIndex);
        useChat.setState({ currentInput: prevSentMessages[newIndex] });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prevSentMessageIndex, prevSentMessages, open]);

  const handleMessageSend = useCallback(
    (currentInput: string) => {
      if (currentInput === "") {
        useChat.setState({ open: false });
        fetchNui("CHAT_CLOSED");
        return;
      }
      if (settings.sounds) {
        useAudioPlayerStore.getState().play("message_sent")
      }

      if (isEnvBrowser()) {
        useChat.setState({
          messages: [
            ...useChat.getState().messages,
            {
              text: currentInput,
              tags: [{ text: "me", color: "blue" }],
            },
          ],
        });
      } else {
        // close 
        useChat.setState({ open: false });
        fetchNui("CHAT_MESSAGE", { message: currentInput });
      }

      setPrevSentMessages([...prevSentMessages, currentInput]);
      setPrevSentMessageIndex(null);
      useChat.setState({ currentInput: "" });
    },
    [prevSentMessages, settings.sounds]
  );

  // listen for enter key while input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleMessageSend(currentInput);
      }
    };
    if (inputRef.current) {
      inputRef.current.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [currentInput]); // Only run when the input changes

  // Handle refocusing the input when it loses focus
  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

    // Refocus input when `open` becomes true or on page load
    useEffect(() => {
      if (open && inputRef.current) {
        inputRef.current.focus();
      }
    }, [open]);



  return (
    <Flex>
      <Flex
        pos="absolute"
        left={open ? "0" : "-60vh"}
        mt="auto"
        bg="rgba(0,0,0,0.5)"
        w="100%"
        align="center"
        style={{
          borderRadius: theme.radius.xxs,
          transition: "all 0.1s ease-in-out",
          outline: `0.2vh solid ${colorWithAlpha(theme.colors[theme.primaryColor][9], 0.5)}`,
        }}
      >
        <input
          ref={inputRef} // Assign the ref
          style={{
            background: "transparent",
            border: "none",
            width: "100%",
            height: "100%",
            outline: "none",
            fontFamily: theme.fontFamily,
            color: "rgba(255,255,255,0.8)",
            padding: theme.spacing.xs,
            alignContent: "center",
            fontSize: theme.fontSizes.xs,
          }}
          value={currentInput}
          type="text"
          spellCheck={false}
          onChange={(e) => useChat.setState({ currentInput: e.target.value })}
          onBlur={handleBlur} // Ensure refocus on blur
        />
        <InputButton
          inUse={settingsOpen}
          icon="fa fa-cog"
          onClick={() => setSettingsOpen(!settingsOpen)}
        />
        <InputButton
          icon="fa fa-paper-plane"
          onClick={() => handleMessageSend(currentInput)}
        />
        <SettingsMenu open={settingsOpen} />
      </Flex>
      <SuggestionBox />
    </Flex>
  );
}

function SuggestionBox(){
  const theme = useMantineTheme()
  const open = useChat(state => state.open)
  const currentInput = useChat(state => state.currentInput)
  const commands = useChat(state => state.commands)
  const [currentSuggestions, setCurrentSuggestions] = useState<CommandProps[]>([])
  const [currentParamPosition, setCurrentParamPosition] = useState<number | null>(null)

  // if global closes close the suggestions
  useEffect(() => {
    if (!open) {
      setCurrentSuggestions([])
    }
  }, [open]) 

  // Listen for tab key for autocomplete of first recommended suggestion 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (currentSuggestions.length > 0) {
          useChat.setState({ currentInput: `/${currentSuggestions[0].name}` })
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentSuggestions])
    
  // If the input starts with / assume its a command and look for suggestions. 
  // If the input == the command name, show the help text for the command. 
  // If the input shows the command name and a space then show the help text along with the first param. so on and so forth.
  useEffect(() => {
    if (currentInput.startsWith('/') && currentInput.length > 1) {
      const input = currentInput.slice(1)
      const inputParts = input.split(' ')
      const commandName = inputParts[0]
      const command = commands.find(command => command.name === commandName)
      if (command) {
        setCurrentSuggestions([command])
        if (inputParts.length > 1) {
          const paramPosition = inputParts.length - 1
          setCurrentParamPosition(paramPosition)
        }
        else {
          setCurrentParamPosition(null)
        }
      } else {
        setCurrentSuggestions(commands.filter(command => command.name.startsWith(commandName)))
      }
    } else {
      setCurrentSuggestions([])
      setCurrentParamPosition(null)
    }
  }, [currentInput, commands])


  return (
    <Flex
      pos='absolute'
      p='xs'
      direction={'column'}
      bottom='-4vh'
      left={currentSuggestions.length === 0 ? '-50vh' : '0'}
      bg='rgba(0,0,0,0.5)'
      w='100%'
      mah='10vh'
      gap='0.1vh'
      style={{
        overflow: 'hidden',
        // opacity: currentSuggestions.length === 0 ? 0 : 1,
        outline: `0.2vh solid ${colorWithAlpha(theme.colors[theme.primaryColor][9], 0.5)}`,
        transform: 'translateY(100%)',
        transition: 'all 0.3s ease-in-out',
        borderRadius: theme.radius.xxs,
      }}

    >
      {currentSuggestions.map((command) => (
        <Flex
          direction={'column'}
        >
          <Flex
            gap='xxs'
          >
            <Text
              size='xs'
            >/{command.name}</Text>
            {command.params && command.params.map((param, indexOf) => (
              <Text
                size='xs'
                c={currentParamPosition === (indexOf + 1 )? theme.colors[theme.primaryColor][9] : 'rgba(255,255,255,0.8)'}
              >[{param.name}]</Text>
            ))}


          </Flex>
          <Text size='xxs'>
            {currentParamPosition == null && command.help || command.params && currentParamPosition && command.params[currentParamPosition - 1]?.help} 
          </Text>
        </Flex> 
      ))}
    </Flex>
  )
}

export default InputBar;