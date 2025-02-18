RegisterCommand('clear', function()
  SendNUIMessage({
    action = 'CLEAR_CHAT'
  })
end, false)