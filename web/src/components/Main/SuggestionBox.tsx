import { useMantineTheme, Flex, Text } from "@mantine/core"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import colorWithAlpha from "../../utils/colorWithAlpha"
import useChat, { CommandProps } from "./store"

// @ts-expect-error Doesnt like mantine/flex
export const MotionFlex = motion(Flex)

export default function SuggestionBox() {
  const theme = useMantineTheme()
  const open = useChat(state => state.open)
  const currentInput = useChat(state => state.currentInput)
  const commands = useChat(state => state.commands)
  const [currentSuggestions, setCurrentSuggestions] = useState<CommandProps[]>([])
  const [currentParamPosition, setCurrentParamPosition] = useState<number | null>(null)

  // Memoize suggestions calculation for better performance
  const suggestions = useMemo(() => {
    if (!currentInput.startsWith('/') || currentInput.length <= 1) {
      return { suggestions: [], paramPosition: null }
    }

    const input = currentInput.slice(1)
    const inputParts = input.split(' ')
    const commandName = inputParts[0]
    const command = commands.find(cmd => cmd.name === commandName)
    
    if (command) {
      const paramPosition = inputParts.length > 1 ? inputParts.length - 1 : null
      return { suggestions: [command], paramPosition }
    } else {
      const filteredCommands = commands.filter(cmd => cmd.name.startsWith(commandName))
      return { suggestions: filteredCommands, paramPosition: null }
    }
  }, [currentInput, commands])

  // Update state when suggestions change
  useEffect(() => {
    setCurrentSuggestions(suggestions.suggestions)
    setCurrentParamPosition(suggestions.paramPosition)
  }, [suggestions])

  // Clear suggestions when chat closes
  useEffect(() => {
    if (!open) {
      setCurrentSuggestions([])
    }
  }, [open])

  // Handle tab key for autocomplete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && currentSuggestions.length > 0) {
        e.preventDefault()
        useChat.setState({ currentInput: `/${currentSuggestions[0].name} ` })
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentSuggestions])

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  }

  const getHelpText = (command: CommandProps) => {
    if (currentParamPosition === null) {
      return command.help
    }
    if (command.params && currentParamPosition && command.params[currentParamPosition - 1]) {
      return command.params[currentParamPosition - 1].help
    }
    return command.help
  }

  return (
    <AnimatePresence mode="wait">
      {currentSuggestions.length > 0 && (
        <MotionFlex
          key="suggestion-box"
          pos="absolute"
          p="xs"
          direction="column"
          top="calc(100% + 4vh)" // Start 8px below the input box
          left="0"
          bg="rgba(0,0,0,0.6)"
          w="100%"
          mah="12vh"
          gap="xs"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            overflow: "auto",
            borderRadius: theme.radius.xs,
          }}
        >
          {currentSuggestions.map((command, index) => (
            <motion.div
              key={`${command.name}-${index}`}
              variants={itemVariants}
            >
              <Flex direction="column" gap="xxs">
                <Flex gap="xs" align="center" wrap="wrap">
                  <Text
                    size="xs"
                    fw={500}
                    c={theme.colors[theme.primaryColor][9]}
                  >
                    /{command.name}
                  </Text>
                  {command.params?.map((param, paramIndex) => (
                    <motion.div
                      key={`${param.name}-${paramIndex}`}
                      initial={{ scale: 0.9 }}
                      animate={{ 
                        scale: currentParamPosition === (paramIndex + 1) ? 1.1 : 1,
                        color: currentParamPosition === (paramIndex + 1) 
                          ? theme.colors[theme.primaryColor][9]
                          : 'rgba(255,255,255,0.7)'
                      }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    >
                      <Text
                        size="xxs"
                        style={{
                          padding: '0.2vh 0.3vh',
                          borderRadius: theme.radius.xs,
                          backgroundColor: currentParamPosition === (paramIndex + 1)
                            ? colorWithAlpha(theme.colors[theme.primaryColor][9], 0.2)
                            : 'transparent',
                          border: currentParamPosition === (paramIndex + 1)
                            ? `1px solid ${colorWithAlpha(theme.colors[theme.primaryColor][5], 0.5)}`
                            : '1px solid transparent'
                        }}
                      >
                        [{param.name}]
                      </Text>
                    </motion.div>
                  ))}
                </Flex>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Text 
                    size="xxs" 
                    c="rgba(255,255,255,0.8)"
                    style={{ 
                      fontStyle: 'italic',
                      lineHeight: 1.3
                    }}
                  >
                    {getHelpText(command)}
                  </Text>
                </motion.div>
              </Flex>
            </motion.div>
          ))}
        </MotionFlex>
      )}
    </AnimatePresence>
  )
}