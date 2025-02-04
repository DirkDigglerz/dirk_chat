-- INIT 
CreateThread(function()
  SetTextChatEnabled(false)
  SetNuiFocus(false)
  LocalPlayer.state.chatDisplay = false
end)


RegisterNuiCallback('GET_SETTINGS', function(data, cb)
  cb({
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
  })
end)


-- KEYBIND
RegisterKeyMapping('toggleChat', 'Toggle chat', 'keyboard', 't')

RegisterCommand('toggleChat', function()
  toggleChat()
end, false)
