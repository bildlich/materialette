const electron = require('electron');

const menubar = require('menubar')({
  width: 9*(36+6)+110,
  height: 2*(36+6)+36,
  icon: __dirname + '/assets/IconTemplate.png',
  dir: __dirname,
  alwaysOnTop: true,
  tooltip: "ms-colors",
  resizable: false
});

menubar.on('ready', ()=>{
  global.sharedObj = {
    hide: menubar.hideWindow,
    quit: menubar.app.quit,
    pinned: false
  }
});

menubar.on('focus-lost', () => {
  if (!global.sharedObj.pinned) {
    menubar.hideWindow();
  }
})
