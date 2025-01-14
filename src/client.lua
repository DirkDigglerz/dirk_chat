local toggleChat = function(state)
  if state ~= nil then LocalPlayer.state.chatDisplay = state end  
  if state == nil then LocalPlayer.state.chatDisplay = not LocalPlayer.state.chatDisplay end
  print(('Chat display is now %s'):format(LocalPlayer.state.chatDisplay and 'visible' or 'hidden'))

  if LocalPlayer.state.chatDisplay then
    SetNuiFocus(true, true)
    SetCursorLocation(0.5, 0.5)
  else
    SetNuiFocus(false)
  end

  SendNUIMessage({
    action = 'TOGGLE_CHAT',
    data = LocalPlayer.state.chatDisplay
  })

end


local addMessage = function(channel, message)
  if type(message) == 'string' then
    message = {
      text = message,
      tags = {
        {
          text = 'User',
          color = '#ffffff'
        },
        {
          -- text = GetPlayerName(PlayerId()),
          text= 'Player',
          color = '#ffffff'
        }
      }
    }
  end

  SendNUIMessage({
    action = 'ADD_MESSAGE',
    data = {
      channel = channel,
      message = message
    }
  })
end

RegisterNetEvent('clean_chat:addMessage', function(channel, message)
  addMessage(channel, message)
end)



-- KEYBIND
RegisterKeyMapping('toggleChat', 'Toggle chat', 'keyboard', 't')

RegisterCommand('toggleChat', function()
  toggleChat()
end, false)

local getUserChatSettings = function()
  return {
    hide = GetResourceKvpString('messageHideMode') or basic.messageHideMode,
    hideTimeout = GetResourceKvpInt('messageHideTimeout') or basic.messageHideTimeout,
    sounds = GetResourceKvpString('messageSounds') or basic.messageSounds
  }
end

local updateUserSettings = function(settings)
  SetResourceKvp('messageHideMode', settings.hide)
  SetResourceKvpInt('messageHideTimeout', settings.hideTimeout)
  SetResourceKvp('messageSounds', settings.sounds)
end

-- NUI CALLBACK 

RegisterNuiCallback('CHAT_CLOSED', function(data, cb)
  LocalPlayer.state.chatDisplay = false
  SetNuiFocus(false)
  cb('ok')
end)

RegisterNuiCallback('CHAT_MESSAGE', function(data, cb)
  SetNuiFocus(false, false)
  LocalPlayer.state.chatDisplay = false

  local message = data.message
  local channel = data.channel or 'global'
  if message:sub(1, 1) == '/' then
    ExecuteCommand(message:sub(2))
  else
    TriggerServerEvent('clean_chat:addMessage', channel, message)
  end
  cb('ok')
end)

RegisterNuiCallback('GET_SETTINGS', function(data, cb)
  return {
    settings        = getUserChatSettings(),
    primaryColor    = GetConvar('clean_lib:primaryColor', 'clean'),
    primaryShade    = GetConvarInt('clean_lib:primaryShade', 9),
    customTheme     = json.decode(GetConvar('clean_lib:customTheme', json.encode({
      "#f8edff",
      "#e9d9f6",
      "#d0b2e8",
      "#b588da",
      "#9e65cf",
      "#914ec8",
      "#8a43c6",
      "#7734af",
      "#692d9d",
      "#5c258b"
    }))),
  }
end)

-- COMPAT 

RegisterNetEvent('chat:clear', function(name)
  SendNUIMessage({
    type = 'CLEAR_CHAT'
  })
end)

-- INIT 
CreateThread(function()
  SetTextChatEnabled(false)
  SetNuiFocus(false)
  LocalPlayer.state.chatDisplay = false
end)
