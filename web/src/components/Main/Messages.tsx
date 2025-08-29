import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Text, Transition, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import useChat, { MessageProps, MessageTags } from "./store";

export default function Messages() {
  const settings = useChat((state) => state.settings);
  const open = useChat((state) => state.open);
  const messages = useChat((state) => state.messages);
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const [display, setDisplay] = useState(open || settings.hide !== "always");

  useEffect(() => {
    setDisplay(open || settings.hide !== "always");
  }, [open, settings.hide]);


  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
  
    if (!open && settings.hide === "auto") {
      setDisplay(true); // Ensure messages appear when they arrive
  
      hideTimer.current = setTimeout(() => {
        setDisplay(false);
      }, settings.hideTimeout);
    } else {
      setDisplay(open); // Ensure they stay open if chat is open
    }
  
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [open, settings.hide, settings.hideTimeout, messages.length]); // Watch messages.length instead of messages to trigger on new messages
  

  useEffect(() => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, [messages]);

  // on open also scroll to bottom
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [open]);

  return (
    <Flex
      direction="column"
      h="100%"
      flex={1}
      style={{
        opacity: display ? 1 : 0,
        transition: "all 0.5s ease-in-out",
        borderRadius: theme.radius.xs,
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
        ref={containerRef}
      >
        {messages.map((message, i) => (
          <Message key={i} {...message} />
        ))}
      </Flex>
    </Flex>
  );
}

function Message(props: MessageProps) {
  const theme = useMantineTheme();
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDisplay(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Transition mounted={display} transition="slide-left" duration={500}>
      {(transition) => (
        <Flex
          align="center"
          gap="xs"
          bg="rgba(0,0,0,0.5)"
          p="xxs"
          mr="xxs"
          style={{
            borderRadius: theme.radius.xs,
            ...transition,
          }}
        >
          <Flex gap="xs">
            {props.tags?.map((tag, i) => (
              <Tag key={i} {...tag} />
            ))}
          </Flex>
          <Text size="xxs" c="rgba(255,255,255,0.8)"
          style={{
            whiteSpace: "pre-wrap",
          }}
          >{props.text?.replace(/\^([0-9])/g, () => '')}</Text>
        </Flex>
      )}
    </Transition>
  );
}

function Tag(props: MessageTags) {
  const theme = useMantineTheme();
  return (
    <Flex
      bg={props.color}
      p="xxs"
      align="center"
      justify="center"
      gap="xxs"
      style={{ borderRadius: theme.radius.xs }}
    >
      {props.icon && (
        <FontAwesomeIcon
          icon={props.icon as IconProp}
          color="white"
          style={{ fontSize: theme.fontSizes.xxs }}
        />
      )}
      <Text
        size="xxs"
        c="white"
        style={{ fontFamily: "Akrobat Bold" }}
      >
        {props.text.toUpperCase()}
      </Text>
    </Flex>
  );
}
