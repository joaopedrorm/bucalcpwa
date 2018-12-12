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
		
		var label = document.getElementById('label').value || '';
		var balance = document.getElementById('balance').value || '0';
		var outwardprice = document.getElementById('outwardprice').value || '0';
		var returnprice = document.getElementById('returnprice').value || '0';
		
		if (!app.cards) {
			app.cards = [];
		}
		
		var key = app.cards.length === 0 ? 0 : app.cards[app.cards.length - 1].key + 1;
		
		var cardData = {
			key: key,
			label: label,
			created: new Date(),
			balance: parseFloat(balance),
			outwardprice: parseFloat(outwardprice),
			returnprice: parseFloat(returnprice)
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
			
			let cardTitle = '#' + data.key + ' ' + data.label + ' - ' + new Date(data.created).toLocaleString();
			card.querySelector('.card-title-text').textContent = cardTitle;
			
			card.querySelector('.close').addEventListener("click", function() {
				let thiscard = this.closest('.card');
				let key = thiscard.querySelector('.key').innerText;
				app.visibleCards[key] = undefined;
				key = parseInt(key);
				for (let i = 0; i < app.cards.length; i++) {
					if (app.cards[i].key === key) {
						app.cards.splice(i,1);
						break;
					}
				}
				app.saveCards();
				thiscard.remove();
			});
			
			card.querySelector('.key').textContent = data.key;
			card.removeAttribute('hidden');
			app.container.appendChild(card);
			app.visibleCards[data.key] = card;
		}

		card.querySelector('.balance').textContent = data.balance.toFixed(2);
		card.querySelector('.outwardprice').textContent = data.outwardprice;
		card.querySelector('.returnprice').textContent = data.returnprice;
		
		// calculate recharge options
		var table = card.querySelector('.resulttable');
		
		// clear old table lines
		var oldNodes = table.querySelectorAll(".result");
		for (let i = 0; i < oldNodes.length; i++) {
			oldNodes[i].remove();
		}
		
		var rechargeTable = app.calculateBURechargeArray(data);
		
		// add result lines
		for (let i = 0; i < rechargeTable.length; i++) {
		
			var tr =  table.querySelector('.resulttr').cloneNode(true);
			
			tr.classList.remove('resulttr');
			tr.classList.add('result');
			
			tr.querySelector('.outwardtickets').textContent = rechargeTable[i].outwardtickets;
			tr.querySelector('.returntickets').textContent = rechargeTable[i].returntickets;
			tr.querySelector('.newbalance').textContent = rechargeTable[i].newbalance;
			tr.querySelector('.creditrecharge').textContent = rechargeTable[i].creditrecharge;
			tr.removeAttribute('hidden');
			
			table.appendChild(tr);
		}
		
	};

	
	/*****************************************************************************
	 *
	 * Bussiness Logic
	 *
	 ****************************************************************************/

	app.calculateBURechargeArray = function(data) {
		// work with integers only to avoid float point numbers problems
		let dailyCost = Math.round( (data.outwardprice + data.returnprice) * 100);
		let balance = Math.round( data.balance * 100 );
		let balanceCeilLimit = 1000.00 * 100;
		
		var returnArray = [];
		
		if( dailyCost <= 0 ) {
			return returnArray;
		}

		for (let i = Math.ceil( balance/dailyCost ); i*dailyCost < balanceCeilLimit; i++) {
			let newbalance = i * dailyCost;
			let recharge = newbalance - balance;
			if( recharge % 5 === 0 ) {
				returnArray.push( {
					outwardtickets: i,
					returntickets: i,
					newbalance: (newbalance/100.00).toFixed(2),
					creditrecharge: (recharge/100.00).toFixed(2)
				});
			}
		}
		
		
		return returnArray;
	}

	var initialBusTicketRecharge = {
		key: 0,
		label: 'Example',
		created: new Date(),
		balance: 0.00,
		outwardprice: 6.96,
		returnprice: 6.96
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
		app.hideSpinner();
	};

	app.saveCards = function() {
		var cards = JSON.stringify(app.cards);
		localStorage.cards = cards;
	};

	app.loadCards = function() {
		var cards = localStorage.cards;
		if (cards) {
			cards = JSON.parse(cards);
		}
		return cards;
	}
		

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
	
	app.hideSpinner();

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
						 .register('./service-worker.js')
						 .then(function() { console.log('Service Worker Registered'); });
	}
})();
