// Epic Games Store
async function getEpicGamesGames() {
	const apiUrl =
		'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';
	const res = await fetch(apiUrl);
	const data = await res.json();
	return filterEpicGamesGames(data);
}

const filterEpicGamesGames = (data) => {
	const games = data.data.Catalog.searchStore.elements;
	const filteredGames = games.filter(
		(game) => game.price.totalPrice.discountPrice == 0
	);
	const response = filteredGames.map((game) => ({
		url: `https://store.epicgames.com/en-US/p/${game.catalogNs.mappings[0].pageSlug}`,
		imageUrl: game.keyImages.find(
			(image) => image.type === 'OfferImageWide'
		).url,
		title: game.title,
		originalPrice: game.price.totalPrice.originalPrice / 100,
		discountPrice: game.price.totalPrice.discountPrice / 100,
	}));
	return response;
};

// GOG.com
async function getGOGGames() {
	const url = 'https://catalog.gog.com/v1/catalog';
	const response = await fetch(url);
	const data = await response.json();
	return filterGOGGames(data);
}

const filterGOGGames = (data) => {
	const games = data.products;
	const filteredGames = games.filter(
		(game) => game.price.finalMoney.amount == 0
	);
	const response = filteredGames.map((game) => ({
		url: game.storeLink,
		imageUrl: game.coverHorizontal,
		title: game.title,
		originalPrice: game.price.baseMoney.amount,
		discountPrice: game.price.finalMoney.amount,
	}));
	return response;
};

// Humble Bundle
async function getHumbleBundleGames() {
	const url =
		'https://www.humblebundle.com/store/api/search?sort=discount&filter=onsale&request=1';
	const response = await fetch(url);
	const data = await response.json();
	return filterHumbleBundleGames(data);
}

const filterHumbleBundleGames = (data) => {
	const games = data.results;
	const filteredGames = games.filter(
		(game) => game.current_price.amount == 0
	);
	const response = filteredGames.map((game) => ({
		url: `https://www.humblebundle.com/store/${game.human_url}`,
		imageUrl: game.featured_image_recommendation,
		title: game.human_name,
		originalPrice: game.full_price.amount,
		discountPrice: game.current_price.amount,
	}));
	return response;
};

// Main function
async function getAllGames() {
	const epicgames = await getEpicGamesGames();
	const GOG = await getGOGGames();
	const humblebundle = await getHumbleBundleGames();

	const result = [...epicgames, ...GOG, ...humblebundle];
	return result;
}
