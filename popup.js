function filterGames(games){
    return games.filter((game) => {
        return game.promotions.promotionalOffers.length > 0;
    });
}

chrome.runtime.sendMessage({name: 'fetchGames'}, (response) => {
    // Filter games
    const games = response.data.data.Catalog.searchStore.elements;
    const availableGames = filterGames(games);

    // Update HTML

    // Update local storage

    // Manage popup

    console.log(availableGames);
})