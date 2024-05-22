function formatTitle(title, max) {
	return title.length < max ? title : title.slice(0, max + 3) + '...';
}

function updateHTML(games) {
	const gamesHTML = document.getElementById('games');
	gamesHTML.innerHTML = '';
	games.forEach((game) => {
		gamesHTML.innerHTML += `
            <a class="game" href=${game.url} target="_blank">
                <div class="game__image-container">
                    <img src=${game.imageUrl} alt="${game.title} image" class="game__image">
                </div>
                <div class="game__info">
                    <h2 class="game__info-title">${formatTitle(game.title, 22)}</h2>
                    <div class="game__info-details">
                        <div class="game__prices">
                            <p class="game__info-price game__info-price_original">USD$${game.originalPrice}</p>
                            <p class="game__info-price game__info-price_discount">USD$${game.discountPrice}</p>
                        </div>
                        <svg class="game__info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                    </div>
                </div>
            </a>
            <div class="game-divider"></div>
        `;
	});
}

async function main() {
	browser.runtime.sendMessage({ name: 'resetIcon' }).then(() => {
		browser.runtime.sendMessage({ name: 'fetchGames' }).then((response) => {
            console.log(response);
			updateHTML(response);
		});
	});
}

main();
