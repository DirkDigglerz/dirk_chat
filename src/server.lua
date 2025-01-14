

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
          color = '#ffffff'
        },

        {
          text = GetPlayerName(src),
          color = '#ffffff'
        }
      }

    }
  end

  print(('Player %s sent message %s'):format(src, message.text))
  TriggerClientEvent('clean_chat:addMessage', -1, channel, message)
end

RegisterNetEvent('clean_chat:addMessage', function(channel, message)
  local src = source
  addMessage(src, channel, message)
end)

