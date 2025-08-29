import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, Flex, SegmentedControl, Slider, Text, useMantineTheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import colorWithAlpha from "../../utils/colorWithAlpha";
import { fetchNui } from "../../utils/fetchNui";
import useChat from "./store";

type SettingsOptionProps = {
  keyIndex: string;
  label   : string;
  icon    : string;
  type    : 'checkbox' | 'slider' | 'segments';
  segments?: string[];
  min?    : number;
  max?    : number;
}

export default function SettingsOption(props:SettingsOptionProps){ 
  const {hovered, ref} = useHover()
  const settings = useChat(state => state.settings)
  
  const handleSettingsChange = () => {
    fetchNui('UPDATE_CHAT_SETTINGS', {
      settings: useChat.getState().settings
    })
  }
  const theme = useMantineTheme()
  return (
    <Flex
      direction={props.type === 'segments' ? 'column' : 'row'}
      w='100%'
      ref={ref}
      onClick={() => {
        // if it sa checkbox manualy change the value
        if(props.type === 'checkbox'){
          useChat.setState({
            settings: {
              ...settings,
              [props.keyIndex]: !settings[props.keyIndex as keyof typeof settings]
            }
          })
          handleSettingsChange()
        } 
      }
    }
      gap='xs'
      align='center'
      p='xs'
      bg={hovered && (props.type != 'segments' && props.type != 'slider') ? 'rgba(44,44,44,0.7)': 'rgba(44,44,44,0.5)'}
      style={{
        cursor: 'pointer',
        transition: 'all 0.1s ease-in-out',
        borderRadius: theme.radius.xs,
      }}
    >
      <Flex
        align='center'
        gap='xs'
      >
        <FontAwesomeIcon icon={props.icon as IconProp} 
          color='rgba(255,255,255,0.8)'
          style={{
            fontSize: theme.fontSizes.xxs,
          }}
        />
        <Text
          size='xxs'
        >
          {props.label}
        </Text>
      </Flex>


      {props.type === 'checkbox' && (
        <Checkbox 
          size='sm'
          ml='auto'
          radius='xs'
          checked={settings[props.keyIndex as keyof typeof settings] as boolean}
      
          onChange={(e) => {
            useChat.setState({
              settings: {
                ...settings,
                [props.keyIndex]: e.currentTarget.checked
              }
            })
            handleSettingsChange()
          }}
        />
      )}

      {props.type === 'segments' && (
        <SegmentedControl
          bg='rgba(0,0,0,0.5)'
          radius='xs'
          size='xxs'
          w='100%'

          color={colorWithAlpha(theme.colors[theme.primaryColor][9], 0.7)}
          withItemsBorders={false}
          data={props.segments as string[]}
          value={(settings[props.keyIndex as keyof typeof settings] as string).toUpperCase()} 
          onChange={(value) => {
            useChat.setState({
              settings: {
                ...settings,
                [props.keyIndex]: value.toLowerCase()
              }
            })
            handleSettingsChange()
          }}  
        />
      )}


      {props.type === 'slider' && (
        <Slider
          label = {(value: number) => (
            <Text
              size='xxs'
            >
              {value} Seconds
            </Text>
          )}
          radius='xs'
          styles={{
            thumb: {
              aspectRatio: 1,
            },
            label: {
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.xs,
              backgroundColor: 'rgba(0,0,0,0.5)',
              bottom: 'calc(100% + 0.5vh)',
              aspectRatio: '1/1',
              fontSize: '1vh',
          
            }
          }}
          flex={1}
          value={settings[props.keyIndex as keyof typeof settings] as number}
          min={props.min || 0}
          max={props.max || 100}
          onChange={(value) => {
            useChat.setState({
              settings: {
                ...settings,
                [props.keyIndex]: value
              }
            })
            handleSettingsChange()
          }}
          
        />
      )}
      

    </Flex>
  )
}