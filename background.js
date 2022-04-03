'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// bot stuff
const path = require('path');
const { ipcMain } = require('electron');
const fs = require('file-system');

const { Builder, By, Key, until } = require('selenium-webdriver');
const { Result } = require('selenium-webdriver/io/exec');
const https = require('https');

let driver;

// minimum 30 s. = 1 play
const playTimeSpotify = 35000;

// read & parse local json documents
const accountsList = JSON.parse(fs.readFileSync("/Users/alexandermathieu/Coding/node/bot/accounts.json", {encoding:'utf8', flag:'r'}));
const playlistsList = JSON.parse(fs.readFileSync("/Users/alexandermathieu/Coding/node/bot/playlist.json", {encoding:'utf8', flag:'r'}));

class Account {
  constructor(email, passwort, playlist) {
    this.state = "Stop";
    this.email = email;
    this.passwort = passwort;
    this.currentSong = 0;
    this.currentBand = "None";
    this.currentTitle = "None";
    this.currentImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png";
    this.logPlayedSongs = 0;
    this.playlist = playlist;
    this.driver;
  }
}

let accountsArray = new Array();

for (let i = 0; i < accountsList.spotify.length - 3; i++){
  accountsArray[i] = new Account(accountsList.spotify[i].email, accountsList.spotify[i].passwort, playlistsList.spotify);
}

let startDate = new Date();

let logger = {songsPlayed: 0, playlistsPlayed: 0, start: startDate};

// end botstuff









// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.

  const win = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.resolve(__static, 'preload.js'),
    }
  })
  
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


// ipc stuff

let xxx;


ipcMain.on('READ_FILE', (event, payload) => {
  xxx = event;
  console.log("no")
  const content = fs.readFileSync(payload.path, 'utf-8');
  event.reply('READ_FILE', { content });
  console.log(content);

  //world();

  //main(event);
});


ipcMain.on('READ_LX', (event2, payload2) => {
  console.log("yes")

  let content = "la";
  xxx.reply('READ_FILE', { content });
  //const content = fs.readFileSync(payload2.path, 'utf-8');
  event2.reply('READ_LX', { content });
  console.log(content);

  //world();

  //main(event);
});

async function world() {

  console.log("fuck")
  let content = "fuck"

  xxx.reply('READ_FILE', { content });
}

//world();


let refreshEvent; 

ipcMain.on('START_DRIVER', (event, payload) => {
  console.log("start driver");

  refreshEvent = event;

  main();
});

function refreshRenderer(){
  let content = JSON.stringify(accountsArray);
  refreshEvent.reply('START_DRIVER', { content });
}


async function main() {

  for (let i = 0; i < accountsArray.length; i++){
  
    console.log("Logging in account: " + accountsArray[i].email + "...");
    accountsArray[i].driver = await new Builder().forBrowser("chrome").build();

    refreshRenderer();

    const num_startPlaylist = 0;

    try{
      if (accountsArray[i].state = "Stop"){
        let loginState = await loginSpotify(accountsArray[i]);

        if (loginState){
          accountsArray[i].state = "Login OK"
        }
      }

      refreshRenderer();
      dispatcher(accountsArray[i],num_startPlaylist);
    }
    catch(e){
      console.log("Exception: " + e);
    }
  }
}



async function loginSpotify(account){

  let result = false;

  try
  {
    // go to website & wait until rendered
    await account.driver.get('https://www.spotify.com');
    await sleep(3000);
    
    // 
    await account.driver.findElement(By.id('onetrust-accept-btn-handler')).click();
    
    //await click('Cookies akzeptieren');
    await account.driver.findElement(By.xpath("//*[text()='" + "Cookies akzeptieren" + "']")).click();
    
    //await click('Anmelden');
    await account.driver.findElement(By.xpath("//*[text()='" + "Anmelden" + "']")).click();
    await sleep(1000);
    
    // login account & wait
    await account.driver.findElement(By.id('login-username')).sendKeys(account.email, Key.RETURN);
    await account.driver.findElement(By.id('login-password')).sendKeys(account.passwort, Key.RETURN);
    await sleep(1000)
    
    console.log("Login successful: " + account.email)

    result = true;
  }

  catch(e)
  {
    console.log("Login error: " + account.email);
    console.log("Exception " + e);
    result = false;
  }

  return result;
}


async function dispatcher(account, num_currentSong){
  
  await sleep(1000);
  
  try{
    // OPEN SONG
    account.currentState = "Open link"
    account.currentSong = num_currentSong;
    account.currentBand = account.playlist[num_currentSong].band;
    account.currentTitle = account.playlist[num_currentSong].song;

    await account.driver.get(account.playlist[num_currentSong].link);
    await sleep(2000)

    // FIND SRC OF ALBUM COVER
    let classImage = await account.driver.findElement(By.className("CmkY1Ag0tJDfnFXbGgju"));
    let imageSrc = await classImage.findElement(By.css("img")).getAttribute("src");

    account.currentImage = imageSrc;    
    refreshRenderer();

    // CLICK GREEN PLAY BUTTON
    await account.driver.findElements(By.className("Button-qlcn5g-0 iaAUvZ")).then(function(elements){
      elements.forEach(function (element) {
        element.click(); 
      });
    });
    await sleep(1000);

    // CHECK BUTTON STATE
    let songRunning = false;

    while(!songRunning){

      // CLICK PLAYBUTTON
      await account.driver.findElement(By.className("A8NeSZBojOQuVvK4l1pS")).then(function(element)
      {
        element.click();
      })
      await sleep(1000);

      // find html object and check state of playbutton
      let pButton = await account.driver.findElement(By.className("A8NeSZBojOQuVvK4l1pS"));
      let currentState = await pButton.getAttribute('aria-label');
      //console.log(currentState);
    
      // "Play" means song is not playing
      if(currentState == "Play"){
        songRunning = false;
        console.log(currentState);
        //account.state = "Pause"
      }
      else if (currentState == "Pause"){
        songRunning = true;
        //account.state = "Playing"
      }
      else{
        //exception
      }
    }

    account.state = "Song playing";
    refreshRenderer();

    await sleep(playTimeSpotify);
    logger.songsPlayed += 1;

    account.state = "Song done"
    refreshRenderer();

    account.logPlayedSongs += 1;

    if (num_currentSong >= account.playlist.length - 1){
      num_currentSong = 0;
      logger.playlistsPlayed += 1;
    }
    else {
      num_currentSong += 1;
    }

    var currentDate = new Date();

    console.log(`[Played: ${logger.songsPlayed} songs & ${logger.playlistsPlayed} playlists] ${currentDate.getMinutes() - startDate.getMinutes()} minutes`);

    return dispatcher(account, num_currentSong)
  }
  catch(e){
    console.log("Exception: " + e);
    return;
  }
}



function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
