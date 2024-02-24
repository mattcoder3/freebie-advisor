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

function checkTimeDifference(data){
    // Check date
    const date = new Date().toString();
    let oldDate = data.lastCheckTime;
    if (!oldDate) {
        // If currentTime doesn't exist in storage, save it
        chrome.storage.local.set({ lastCheckTime: date });
        oldDate = date;
    }
    const diff = Date.parse(date) - Date.parse(oldDate);
    const timeDiff = diff/1000/60/60;
    const res = timeDiff > 1;
    if(res) {
        chrome.storage.local.set({ lastCheckTime: date });
    }
    return res;
}

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
    for(item in newGameData){
        if (!storageGameData.some(elem => elem.title === item.title)) {
            storageGameData.push(item);
            res = true;
        }
    }
    // Check for elements in storageGameData that are not in newGameData and remove them from storageGameData
    for(let index = 0; index < storageGameData.size(); index++){
        let item = storageGameData[index];
        if (!newGameData.some(elem => elem.title === item.title)) {
            storageGameData.splice(index, 1);
        }
    } 
    if(res) chrome.storage.local.set({ games: storageGameData });
    return res;
}

chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get('lastCheckTime', (data) => {
        const timePassed = checkTimeDifference(data);
        if(!timePassed) return;
        // Update storage
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
    });
});

