const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const ipcMain = require('electron').ipcMain;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false
  });

  // Only show mainWindow once all page contents are prepared
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

const fileWriter = (event, arg, callback) => {
    fs.appendFile("data/" + arg[0], arg[1] + " " + arg[2] + "\n", function(err) {
    if(err) {
      return console.log(err);
    }
    if (callback) callback();
  });
}

const returnData = (event, arg) => {
  fs.appendFile("data/" + arg, "", 'utf8',function(err) {
    if(err) {
      return console.log(err);
    }
  });
  fs.readFile("data/" + arg, 'utf8', (err, data) => {
    if(err) {
      return console.log(err);
    }

  data = data.split("\n");
    event.sender.send('ScheduleData', data);
  });
  console.log("data read and sent");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
  //createWindow;
  //ipc.on('SubmitButtonClick', fileWriter);
app.on('ready', () => {
    ipcMain.on('SubmitButtonClick', (event, arg) => {
      fileWriter(event, arg, () => {
        event.sender.send('fileWritingDone');
      });
    });
    ipcMain.on('Date', (event, arg) => {
      returnData(event, arg);
    });
});




// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
