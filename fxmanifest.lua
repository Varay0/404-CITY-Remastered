fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'lvx_skin'
author 'lvinnn'
description '404 CITY - Skin / Clothes Menu'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js',
    'html/fonts/*.woff2',
    'html/assets/*.png',
    'html/assets/*.jpg',
    'html/assets/*.svg'
}


client_scripts {
    'config.lua',
    'client.lua'
}

server_scripts {
    'server.lua'
}
