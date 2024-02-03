chrome.runtime.onMessage.addListener((msg,sender,response) => {
    if(msg.name === 'fetchGames'){
        const apiUrl = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';
        console.log(apiUrl);

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

    return true
})