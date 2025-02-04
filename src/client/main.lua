toggleChat = function(state)
  if state ~= nil then LocalPlayer.state.chatDisplay = state end  
  if state == nil then LocalPlayer.state.chatDisplay = not LocalPlayer.state.chatDisplay end
  if LocalPlayer.state.chatDisplay then
    SetNuiFocus(true, true)
    SetCursorLocation(0.5, 0.5)
  else
    SetNuiFocus(false)
  end
  SendNUIMessage({
    action = 'TOGGLE_CHAT',
    data = {
      display = LocalPlayer.state.chatDisplay, 
      registeredCommands = registeredCommands
    }
  })

end


addMessage = function(channel, message, tags)
  if type(message) == 'string' then
    message = {
      text = message,
      tags = tags, 
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

RegisterNetEvent('clean_chat:addMessage', addMessage)
exports('addMessage', addMessage)


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


-- COMPAT 


