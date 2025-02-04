registeredCommands = {}

local addSuggestion = function(name, help, params)
  local invoking_resource = GetCurrentResourceName()
  table.insert(registeredCommands, {name = name, help = help, params = params, invoking_resource = invoking_resource})
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
  refreshAllCommands()
end)