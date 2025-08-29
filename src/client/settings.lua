getUserChatSettings = function()
  local kvpSettingsRaw = GetResourceKvpString('chatSettings')
  local decoded = kvpSettingsRaw and json.decode(kvpSettingsRaw) or {}
  return {
    hide = decoded.hide or basic.messageHideMode,
    hideTimeout = decoded.hideTimeout or basic.messageHideTimeout,
    sounds = decoded.sounds or basic.messageSounds,
    position = decoded.position or basic.position,
    commandOnly = decoded.commandOnly or basic.commandOnly,
    userCustomisation = decoded.userCustomisation or basic.userCustomisation,
  }
end

local updateUserSettings = function(settings)
  SetResourceKvp('chatSettings', json.encode(settings))
end

RegisterNuiCallback('UPDATE_CHAT_SETTINGS', function(data, cb)
  updateUserSettings(data.settings)
  cb('ok')
end)
