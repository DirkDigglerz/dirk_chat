fx_version 'cerulean' 
lua54 'yes' 
games { 'rdr3', 'gta5' } 
author 'DirkScripts' 
description 'Chat - Clean Pack' 
version      '1.0.1'


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

provide 'chat'