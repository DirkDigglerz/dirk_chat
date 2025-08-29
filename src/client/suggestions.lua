registeredCommands = {}

local addSuggestion = function(name, help, params)
  -- print('Adding suggestion', name, help, json.encode(params, {indent = true}))
  local invoking_resource = GetCurrentResourceName()
  table.insert(registeredCommands, {name = name, help = help, params = params, invoking_resource = invoking_resource})
  SendNuiMessage(json.encode({
    action = 'ADD_COMMAND',
    data = {
      name = name,
      help = help,
      params = params
    }
  }))
end 

local removeSuggestionByResource = function(resource)
  for i = #registeredCommands, 1, -1 do
    if registeredCommands[i].invoking_resource == resource then
      table.remove(registeredCommands, i)
    end
  end
end

AddEventHandler('onClientResourceStop', function(resource)
  removeSuggestionByResource(resource)
end)

local refreshAllCommands = function()
  if not GetRegisteredCommands then return false; end 
  local allCommands = GetRegisteredCommands()
  for _, command in ipairs(allCommands) do 
    if IsAceAllowed(('command.%s'):format(command.name)) then
      table.insert(registeredCommands, {name = command.name, help = command.help, params = command.params})
    end
  end 
end

AddEventHandler('onClientResourceStart', function(resource)
  removeSuggestionByResource(resource)
  refreshAllCommands()
end)

CreateThread(function()
  Wait(2000)
  refreshAllCommands()
end)


RegisterNetEvent('chat:addSuggestions', function(suggestions)
  for _, props in ipairs(suggestions) do
    addSuggestion(props.name, props.help, props.params)
  end
end)

RegisterNetEvent('chat:addSuggestion', function(command, help, params)
  command = command:sub(2)
  -- print('Adding suggestion', command, help, json.encode(params, {indent = true}))
  addSuggestion(command, help, params)
end)

