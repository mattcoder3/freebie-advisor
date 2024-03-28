importScripts(['apiHandle.js']);

chrome.runtime.onMessage.addListener((msg, sender, response) => {
	if (msg.name === 'fetchGames') {
		getAllGames().then((games) => {
			response({ message: 'Fetch completed', data: games });
		});
	}
	if (msg.name === 'resetIcon') {
		chrome.action.setIcon({ path: 'icon128.png' });
	}
	return true;
});

function updateLocalStorage(newGameData, storageGameData) {
	if (!storageGameData) {
		chrome.storage.local.set({ games: newGameData });
		return true;
	}
	let res = false;
	// Check for elements in newGameData that are not in storageGameData and add them to storageGameData
	newGameData.forEach((item) => {
		if (!storageGameData.some((elem) => elem.title === item.title)) {
			storageGameData.push(item);
			res = true;
		}
	});
	// Check for elements in storageGameData that are not in newGameData and remove them from storageGameData
	storageGameData.forEach((item, index) => {
		if (!newGameData.some((elem) => elem.title === item.title)) {
			storageGameData.splice(index, 1);
		}
	});
	if (res) chrome.storage.local.set({ games: storageGameData });
	return res;
}

// Function to perform game verification and update
async function checkAndUpdateGames() {
	const games = await getAllGames();
	chrome.storage.local.get('games', (storageData) => {
		const areNewGames = updateLocalStorage(games, storageData.games);
		if (areNewGames) {
			chrome.action.setIcon({ path: 'icon_alert128.png' });
		}
	});
}

chrome.alarms.create('checkGamesAlarm', {
	periodInMinutes: 60, // Repeat every hour
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === 'checkGamesAlarm') {
		console.log('Checking for new games...');
		checkAndUpdateGames(); // Perform the verification
	}
});
