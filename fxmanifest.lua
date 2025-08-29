fx_version 'cerulean' 
lua54 'yes' 
games { 'rdr3', 'gta5' } 
author 'DirkScripts' 
description 'Chat System' 
version      '1.0.7'


shared_script 'settings/*.*'

client_script { 
  'src/client/*.lua',
} 

server_script { 
  'src/server.lua',
}

files{
  'settings/*.lua',
	'web/build/index.html',
	'web/build/**/*',
}

ui_page 'web/build/index.html'
-- ui_page 'http://localhost:3002'

provide 'chat'