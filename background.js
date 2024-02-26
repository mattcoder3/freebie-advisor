const apiUrl = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';

chrome.runtime.onMessage.addListener((msg,sender,response) => {
    if(msg.name === 'fetchGames'){
        fetch(apiUrl).then((res) => {
            if(res.status !== 200) {
                response({message: "Error"});
                return;
            }
            res.json().then((data) => {
                response({message: "Fetch completed", data: data});
            });
        }).catch((err) => {
            response({message: "Error"});
        });
    }

    if(msg.name === 'resetIcon'){
        chrome.action.setIcon({ path: "icon128.png" });
    }

    return true
});

function filterGames(games){
    return games.filter((game) => {
        return game.price.totalPrice.discountPrice == 0;
    });
}

function formatTitle(title, max){
    return title.length < max ? title : title.slice(0,max+3)+'...';
}

function updateLocalStorage(newGameData, storageGameData){
    if(!storageGameData){
        chrome.storage.local.set({ games: newGameData });
        return true
    }
    storageGameData = filterGames(storageGameData);
    newGameData = filterGames(newGameData);
    let res = false;
    // Check for elements in newGameData that are not in storageGameData and add them to storageGameData
    newGameData.forEach((item) => {
        if (!(storageGameData.some(elem => elem.title === item.title))) {
            storageGameData.push(item);
            res = true;
        }
    });
    // Check for elements in storageGameData that are not in newGameData and remove them from storageGameData
    storageGameData.forEach((item, index) => {
        if (!newGameData.some(elem => elem.title === item.title)) {
            storageGameData.splice(index, 1);
        }
    })
    if(res) chrome.storage.local.set({ games: storageGameData });
    return res;
}

// Function to perform game verification and update
function checkAndUpdateGames() {
    fetch(apiUrl).then((res) => { 
        res.json().then((data) => {
            chrome.storage.local.get('games', (storageData) => {
                const newGameData = data.data.Catalog.searchStore.elements;
                const areNewGames = updateLocalStorage(newGameData, storageData.games);
                if(areNewGames){
                    chrome.action.setIcon({ path: "icon_alert128.png" });
                }
            });
        });
    });
}

// Calculate the time remaining until 16:05 UTC (Approximate time when the games usually come out)
const now = new Date();
const utc16 = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 5, 0);
let timeUntil16UTC = utc16 - now;
if (timeUntil16UTC < 0) {
    timeUntil16UTC += 24 * 60 * 60 * 1000; // Add a day if the time has already passed
}

chrome.alarms.create('verificationAlarm', {
    periodInMinutes: 120 // Repeat every 2 hours
});

chrome.alarms.create('verificationAlarm', {
     when: Date.now() + timeUntil16UTC,
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'verificationAlarm') {
	console.log('Checking new games...');
        checkAndUpdateGames(); // Perform the verification
    }
});
