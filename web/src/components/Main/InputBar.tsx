import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Flex, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAudioPlayerStore } from "../../providers/audio/audio"
import colorWithAlpha from "../../utils/colorWithAlpha"
import { fetchNui } from "../../utils/fetchNui"
import { isEnvBrowser } from "../../utils/misc"
import SettingsMenu from "./SettingsMenu"
import useChat from "./store"
import SuggestionBox, { MotionFlex } from "./SuggestionBox"

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prevSentMessages, setPrevSentMessages] = useState<string[]>([]);
  const [prevSentMessageIndex, setPrevSentMessageIndex] = useState<number | null>(null);
  const currentInput = useChat((state) => state.currentInput);
  const theme = useMantineTheme();
  const inputRef = useRef<HTMLInputElement | null>(null); // Reference for the input
  const commandOnly = useChat((state) => state.settings.commandOnly);
  
  // if the open goes to false close Settingsopen 
  useEffect(() => {
    if (!open) {
      setSettingsOpen(false)
    }
  }, [open])

  // Initialize input with "/" when commandOnly is enabled and chat opens
  useEffect(() => {
    if (open && commandOnly && currentInput === "") {
      useChat.setState({ currentInput: "/" });
    }
  }, [open, commandOnly]);

  // Handle input changes to enforce "/" prefix in commandOnly mode
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (commandOnly) {
      // Always ensure the input starts with "/"
      if (!newValue.startsWith("/")) {
        useChat.setState({ currentInput: "/" + newValue });
      } else {
        // Prevent deletion of the "/" by checking if it's trying to be removed
        if (newValue === "" || newValue.length === 0) {
          useChat.setState({ currentInput: "/" });
        } else {
          useChat.setState({ currentInput: newValue });
        }
      }
    } else {
      useChat.setState({ currentInput: newValue });
    }
  }, [commandOnly]);

  // Handle key events for preventing "/" deletion and arrow key navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    
    // Handle "/" protection in commandOnly mode
    if (commandOnly && inputRef.current) {
      const input = inputRef.current;
      const cursorPosition = input.selectionStart || 0;
      
      // Prevent deletion of "/" when it's at the beginning
      if ((e.key === "Backspace" || e.key === "Delete") && 
          cursorPosition === 1 && 
          currentInput.startsWith("/")) {
        e.preventDefault();
        return;
      }
      
      // Prevent cursor from being positioned before "/"
      if (e.key === "ArrowLeft" && cursorPosition === 1) {
        e.preventDefault();
        return;
      }
      
      // Prevent home key from going before "/"
      if (e.key === "Home") {
        e.preventDefault();
        input.setSelectionRange(1, 1);
        return;
      }
    }
    
    // Handle arrow key navigation for message history
    if (prevSentMessages.length === 0) return;
    
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex =
        prevSentMessageIndex === null
          ? prevSentMessages.length - 1
          : Math.max(prevSentMessageIndex - 1, 0);
      setPrevSentMessageIndex(newIndex);
      const message = prevSentMessages[newIndex];
      useChat.setState({ 
        currentInput: commandOnly && !message.startsWith("/") ? "/" + message : message 
      });
    } else if (e.key === "ArrowDown") {
      if (prevSentMessageIndex === null) return;
      e.preventDefault();
      const newIndex = Math.min(prevSentMessageIndex + 1, prevSentMessages.length - 1);
      setPrevSentMessageIndex(newIndex);
      const message = prevSentMessages[newIndex];
      useChat.setState({ 
        currentInput: commandOnly && !message.startsWith("/") ? "/" + message : message 
      });
    }
  }, [prevSentMessageIndex, prevSentMessages, open, commandOnly, currentInput]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleMessageSend = useCallback(
    (currentInput: string) => {
      if (currentInput === "" || (commandOnly && currentInput === "/")) {
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
      
      // Reset input based on commandOnly mode
      useChat.setState({ currentInput: commandOnly ? "/" : "" });
    },
    [prevSentMessages, settings.sounds, commandOnly]
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
  }, [currentInput, handleMessageSend]); // Added handleMessageSend to dependencies

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
      
      // Set cursor position after "/" in commandOnly mode
      if (commandOnly && currentInput.startsWith("/")) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(1, 1);
          }
        }, 0);
      }
    }
  }, [open, commandOnly, currentInput]);

  return (
    <Flex>
      <MotionFlex
        pos="absolute"
        animate={{
          left: open ? "0" : "-100vw",
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 300,
          },
        }}
        mt="auto"
        bg="rgba(0,0,0,0.5)"
        w="100%"
        align="center"
        style={{
          borderRadius: theme.radius.xs,
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
          onChange={handleInputChange}
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
      </MotionFlex>
      <SuggestionBox />
    </Flex>
  );
}

export default InputBar;