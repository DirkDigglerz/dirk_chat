

---@class MessageTags
---@field icon string | nil
---@field text string
---@field color string

---@class MessageProps
---@field text string
---@field tags MessageTags[]|nil

local addMessage = function(src, channel, message)
  if type(message) == 'string' then
    message = {
      text = message,
      tags = {
        {
          text = 'User',
          color = '#4d4d4d'
        },

        {
          text = GetPlayerName(src),
          color = '#4d4d4d'
        }
      }

    }
  end

  TriggerClientEvent('dirk_chat:addMessage', -1, channel, message)
end

exports('addMessage', addMessage)

RegisterNetEvent('dirk_chat:addMessage', function(channel, message)
  local src = source
  addMessage(src, channel, message)
end)

