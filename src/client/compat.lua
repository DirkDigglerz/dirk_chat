-- COMPAT
RegisterNetEvent('__cfx_internal:serverPrint', function(msg)
  addMessage('global', msg, {
    {
      text = 'Server',
      color = 'red'
    }
  })

end)

--deprecated, use chat:addMessage 
AddEventHandler('chatMessage', function(author, color, text)
  addMessage('global', {
    text = text,
    tags = {
      {
        text = author,
        color = color
      }
    }
  })
end)

RegisterNetEvent('chat:clear', function(name)
  SendNUIMessage({
    type = 'CLEAR_CHAT'
  })
end)

--- DEPRECATED COMPAT

local legacyAddMessage = function(message)
  local invokingResource = GetInvokingResource() or 'unknown'
  print(('Deprecation warning: chat:addMessage was called from %s. Please update your resource to use the new chat:addMessage event.'):format(invokingResource))  
  addMessage('global', type(message) == 'string' and message or message.message, {})
end

AddEventHandler('chat:addMessage', legacyAddMessage)

AddEventHandler('chat:addMode', function(mode)
  local invoking = GetInvokingResource() or 'unknown'
  print(('Deprecation warning: chat:addMode was called from %s. Please update your resource to use the new chat:addMode event.'):format(invoking))
end)

AddEventHandler('chat:removeMode', function(name)
  local invoking = GetInvokingResource() or 'unknown'
  print(('Deprecation warning: chat:removeMode was called from %s. Please update your resource to use the new chat:removeMode event.'):format(invoking))
end)

AddEventHandler('chat:addTemplate', function(id, html)
  SendNUIMessage({
    type = 'ON_TEMPLATE_ADD',
    template = {
      id = id,
      html = html
    }
  })
end)


