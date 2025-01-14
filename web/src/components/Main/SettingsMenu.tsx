import { Flex, Menu, Text, useMantineTheme } from "@mantine/core";

type SettingsMenuProps = {
  target?: React.ReactNode;
  open: boolean;
}

export default function SettingsMenu(props:SettingsMenuProps){
  const theme = useMantineTheme()
  return (
    <Flex
      pos='absolute'
      right='-0.5vh'
      bottom={props.open ? '0.1vh' : '100vh'}

      bg='rgba(0,0,0,0.5)'
      // h='3.5vh'
      w='20vh'

      style={{
        transform: 'translateX(100%)',
        borderRadius: theme.radius.xxs,
        transition: 'all 0.3s ease-in-out',
        userSelect: 'none', 
      }}
      direction={'column'}
      // p='xxs'
    >
      <Text
        ta='center'
        size='xs'
        p='xxs'
      >
        SETTINGS
      </Text>
      
    </Flex>
  )
}