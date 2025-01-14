import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Text, Transition, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import useChat, { MessageProps, MessageTags } from "./store";

export default function Messages() {
  const settings = useChat((state) => state.settings);
  const open = useChat((state) => state.open);
  const [display, setDisplay] = useState(
    settings.hide === "never"
      ? true
      : settings.hide === "always" && !open
      ? false
      : settings.hide === "auto" && !open
      ? false
      : true
  );

  const messages = useChat((state) => state.messages);
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // If open is true then show the messages
  useEffect(() => {
    if (open) {
      setDisplay(true);
    }
    
  
  }, [open]);

  useEffect(() => {
    if (settings.hide === "auto") {
      // Ensure any existing timer is cleared
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      // Show the messages and start the timer
      setDisplay(true);

      hideTimer.current = setTimeout(() => {
        setDisplay(false);
      }, settings.hideTimeout);

      // Cleanup timer on component unmount
      return () => {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
        }
      };
    }
  }, [messages, settings.hide, settings.hideTimeout]);
  // Scroll to the bottom when messages change
  useEffect(() => {

    if (containerRef.current) {
      console.log('scrolling')
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Flex
      direction="column"
      h="100%"
      flex={1}
      // p="xxs"
      // bg="rgba(0,0,0,0.5)"
      style={{
        // outline: `0.2vh solid ${colorWithAlpha(theme.colors[theme.primaryColor][9], 0.5)}`,
        opacity: display ? 1 : 0,
        transition: "all 0.5s ease-in-out",
        borderRadius: theme.radius.xxs,
        overflow: "hidden",
      }}
      gap="xs"
    >
      <Flex
        direction="column"
        gap="xs"
        
        h="100%"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
        }}
        ref={containerRef} // Attach the ref to the scrollable container
      >
        {messages.map((message, i) => (
          <Message key={i} {...message} />
        ))}
      </Flex>
    </Flex>
  );
}

function Message(props:MessageProps) {
  const [display, setDisplay] = useState(false)
  const theme = useMantineTheme()

  useEffect(() => {
    setTimeout(() => {
      setDisplay(true)
    }, 100)
  }, [])

  return (
    <Transition 
      mounted={display}
      transition='slide-left'
      duration={500}
    >
      {(transition) => (

        <Flex align="center" gap="xs"
          bg='rgba(0,0,0,0.5)'
          p='xxs'
          mr='xxs'
          style={{
            borderRadius: theme.radius.xxs,
            ...transition,
          }}
        >
          <Flex gap="xs">
            {props.tags?.map((tag, i) => (
              <Tag key={i} {...tag} />
            ))}
          </Flex>
    
          <Text size="xs" c="rgba(255,255,255,0.8)">
            {props.text}
          </Text>
        </Flex>
      )}

    </Transition>

  )
}

function Tag(props:MessageTags) {
  const theme = useMantineTheme()
  return (
    <Flex
      bg={props.color}
      p='xxs'
      align='center'
      justify='center'
      gap='xxs'
      style={{
        borderRadius: theme.radius.xxs
      }}      
    >
      {props.icon && (
        <FontAwesomeIcon icon={props.icon as IconProp} color='white'
          style={{
            fontSize: theme.fontSizes.xxs,
          }}
        />
      )}

      <Text
        size='xxs'
        c={'white'}
        style={{
          fontFamily: 'Akrobat Bold',
        }}
      >{props.text.toUpperCase()}</Text>
    </Flex>
  )
}