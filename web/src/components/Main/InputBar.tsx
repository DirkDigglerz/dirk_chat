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
  const userCustomisation = useChat((state) => state.settings.userCustomisation);
  const commandOnly = useChat((state) => state.settings.commandOnly);
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
        let thisInput = currentInput;
        if (commandOnly && !currentInput.startsWith("/")) {
          thisInput = `/${thisInput}`;
        }
        fetchNui("CHAT_MESSAGE", { message: thisInput });
      }

      setPrevSentMessages([...prevSentMessages, currentInput]);
      setPrevSentMessageIndex(null);
      useChat.setState({ currentInput: "" });
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
          onChange={(e) => useChat.setState({ currentInput: e.target.value })}
          onBlur={handleBlur} // Ensure refocus on blur
        />
        {userCustomisation && (
          <InputButton
            inUse={settingsOpen}
            icon="fa fa-cog"
            onClick={() => setSettingsOpen(!settingsOpen)}
          />
        )}
        <InputButton
          icon="fa fa-paper-plane"
          onClick={() => handleMessageSend(currentInput)}
        />
        {userCustomisation && <SettingsMenu open={settingsOpen} />}
      </MotionFlex>
      <SuggestionBox />
    </Flex>
  );
}



export default InputBar;