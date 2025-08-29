import { Flex, Text, useMantineTheme } from "@mantine/core";
import SettingsOption from "./SettingsOption";

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
      bottom={'3.45vh'}
      p='xxs'
      bg='rgba(0,0,0,0.5)'
      // h='3.5vh'
      w='20vh'
      gap='xs'
      opacity={props.open ? 1 : 0}
      style={{
        transform: 'translate(100%, 100%)',
        borderRadius: theme.radius.xs,
        transition: 'all 0.3s ease-in-out',
        userSelect: 'none', 
      }}
      direction={'column'}
      align='center'
      // p='xxs'
    >
      <Text
        ta='center'
        size='xxs'
        w='90%'
        p='xxs'
        style={{
          fontFamily: 'Akrobat Bold',
          borderBottom: `0.1vh solid ${theme.colors[theme.primaryColor][9]}`
        }}
      >
        SETTINGS
      </Text>
      <SettingsOption
        keyIndex='sounds'
        label='Sounds'
        icon='volume-up'
        type='checkbox'
      />
      <SettingsOption
        keyIndex='hideTimeout'
        label='Hide Timeout'
        icon='clock'
        type='slider'
        min = {1}
        max = {30}
      />
      <SettingsOption
        keyIndex='hide'
        label='Hide Mode'
        icon='eye-slash'
        type='segments'
        segments={['AUTO', 'ALWAYS', 'NEVER']}
      />

    </Flex>
  )
}


