getUserChatSettings = function()
  local kvpSettingsRaw = GetResourceKvpString('chatSettings')
  local decoded = kvpSettingsRaw and json.decode(kvpSettingsRaw) or {}
  return {
    hide = decoded.hide or basic.messageHideMode,
    hideTimeout = decoded.hideTimeout or basic.messageHideTimeout,
    sounds = decoded.sounds == 'true' or basic.messageSounds == 'true',
  }
end

local updateUserSettings = function(settings)
  settings.sounds = settings.sounds and 'true' or 'false'
  SetResourceKvp('chatSettings', json.encode(settings))
end

RegisterNuiCallback('UPDATE_CHAT_SETTINGS', function(data, cb)
  updateUserSettings(data.settings)
  cb('ok')
end)
