(function() {
	'use strict';

	var app = {
		isLoading: true,
		visibleCards: {},
		spinner: document.querySelector('.loader'),
		cardTemplate: document.querySelector('.cardTemplate'),
		container: document.querySelector('.main'),
		addDialog: document.querySelector('.dialog-container'),
	};


	/*****************************************************************************
	 *
	 * Event listeners for UI elements
	 *
	 ****************************************************************************/

	document.getElementById('buttonRefresh').addEventListener('click', function() {
		app.updateCards();
	});

	document.getElementById('buttonAdd').addEventListener('click', function() {
		// Open/show the add new card dialog
		app.toggleAddDialog(true);
	});

	document.getElementById('buttonOK').addEventListener('click', function() {
		
		var balance = document.getElementById('balance').value;
		var outwardprice = document.getElementById('outwardprice').value;
		var returnprice = document.getElementById('returnprice').value;
		
		if (!app.cards) {
			app.cards = [];
		}
		
		var key = app.cards.length === 0 ? 0 : app.cards[app.cards.length - 1].key + 1;
		
		var cardData = {
			key: key,
			label: '#' + key,
			created: new Date(),
			balance: balance,
			outwardprice: outwardprice,
			returnprice: returnprice
		};
		
		app.updateCard(cardData);
		app.cards.push(cardData);
		app.saveCards();
		app.toggleAddDialog(false);
	});

	document.getElementById('buttonCancel').addEventListener('click', function() {
		app.toggleAddDialog(false);
	});


	/*****************************************************************************
	 *
	 * Methods to update/refresh the UI
	 *
	 ****************************************************************************/

	// Toggles the visibility of the add new card dialog.
	app.toggleAddDialog = function(visible) {
		if (visible) {
			app.addDialog.classList.add('dialog-container--visible');
		} else {
			app.addDialog.classList.remove('dialog-container--visible');
		}
	};
	
	app.hideSpinner = function () {
		app.spinner.setAttribute('hidden', true);
		app.container.removeAttribute('hidden');
		app.isLoading = false;
	}
	
	app.showSpinner = function() {
		app.spinner.setAttribute('hidden', false);
		app.container.setAttribute('hidden', true);
		app.isLoading = true;
	}

	// Updates a card. If the card doesn't already exist, it's cloned from the template.
	app.updateCard = function(data) {
		
		var card = app.visibleCards[data.key];
		if (!card) {
			card = app.cardTemplate.cloneNode(true);
			card.classList.remove('cardTemplate');
			card.querySelector('.card-title').textContent = '#' + data.key + ' ' + data.label + ' - ' + new Date(data.created).toLocaleString();
			card.removeAttribute('hidden');
			app.container.appendChild(card);
			app.visibleCards[data.key] = card;
		}

		card.querySelector('.balance').textContent = data.balance;
		card.querySelector('.outwardprice').textContent = data.outwardprice;
		card.querySelector('.returnprice').textContent = data.returnprice;
		
	
		if (app.isLoading) {
			app.hideSpinner();
		}
	};


	/*****************************************************************************
	 *
	 * Methods for dealing with the model
	 *
	 ****************************************************************************/

	// Iterate all of the cards and update
	app.updateCards = function() {
		app.showSpinner();
		app.cards = app.loadCards();
		if (app.cards) {
			app.cards.forEach(function(card) {
				app.updateCard(card);
			});
		}
	};

	app.saveCards = function() {
		var cards = JSON.stringify(app.cards);
		localStorage.cards = cards;
	};

	app.loadCards = function() {
		var cards = localStorage.cards;
		console.log(cards);
		if (cards) {
			cards = JSON.parse(cards);
		}
		return cards;
	}
		

	var initialBusTicketRecharge = {
		key: 0,
		label: 'Example',
		created: new Date(),
		balance: 0.00,
		outwardprice: 6.96,
		returnprice: 6.96
	};

	// Startup code
	app.cards = app.loadCards();
	if (app.cards) {
		app.cards.forEach(function(card) {
			app.updateCard(card);
		});
	} else {
		// The user is using the app for the first time
		app.cards = [];
		app.updateCard(initialBusTicketRecharge);
		app.cards.push(initialBusTicketRecharge);
		app.saveCards();
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
						 .register('./service-worker.js')
						 .then(function() { console.log('Service Worker Registered'); });
	}
})();
