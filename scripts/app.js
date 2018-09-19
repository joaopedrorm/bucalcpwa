// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//			http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


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
		// Refresh all of the forecasts
		app.updateForecasts();
	});

	document.getElementById('buttonAdd').addEventListener('click', function() {
		// Open/show the add new city dialog
		app.toggleAddDialog(true);
	});

	document.getElementById('buttonOK').addEventListener('click', function() {
		// Add the newly selected city
		//var select = document.getElementById('selectCityToAdd');
		//var selected = select.options[select.selectedIndex];
		//var key = selected.value;
		//var label = selected.textContent;
		//if (!app.selectedCities) {
		//	app.selectedCities = [];
		//}
		//app.getForecast(key, label);
		//app.selectedCities.push({key: key, label: label});
		app.saveSelectedCities();
		app.toggleAddDialog(false);
	});

	document.getElementById('buttonCancel').addEventListener('click', function() {
		// Close the add new city dialog
		app.toggleAddDialog(false);
	});


	/*****************************************************************************
	 *
	 * Methods to update/refresh the UI
	 *
	 ****************************************************************************/

	// Toggles the visibility of the add new city dialog.
	app.toggleAddDialog = function(visible) {
		if (visible) {
			app.addDialog.classList.add('dialog-container--visible');
		} else {
			app.addDialog.classList.remove('dialog-container--visible');
		}
	};

	// Updates a weather card with the latest weather forecast. If the card
	// doesn't already exist, it's cloned from the template.
	app.updateForecastCard = function(data) {
		
		var card = app.visibleCards[data.key];
		if (!card) {
			card = app.cardTemplate.cloneNode(true);
			card.classList.remove('cardTemplate');
			card.querySelector('.location').textContent = data.label;
			card.removeAttribute('hidden');
			app.container.appendChild(card);
			app.visibleCards[data.key] = card;
		}

		// Verifies the data provide is newer than what's already visible
		// on the card, if it's not bail, if it is, continue and update the
		// time saved in the card
		var cardLastUpdatedElem = card.querySelector('.card-last-updated');
		var cardLastUpdated = cardLastUpdatedElem.textContent;
		if (cardLastUpdated) {
			cardLastUpdated = new Date(cardLastUpdated);
			// Bail if the card has more recent data then the data
			if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
				return;
			}
		}
		cardLastUpdatedElem.textContent = data.created;

		card.querySelector('.description').textContent = 'Descrição';
		card.querySelector('.date').textContent = 'today';
		//card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
	
		if (app.isLoading) {
			app.spinner.setAttribute('hidden', true);
			app.container.removeAttribute('hidden');
			app.isLoading = false;
		}
	};


	/*****************************************************************************
	 *
	 * Methods for dealing with the model
	 *
	 ****************************************************************************/

	/*
	 * Gets a forecast for a specific city and updates the card with the data.
	 * getForecast() first checks if the weather data is in the cache. If so,
	 * then it gets that data and populates the card with the cached data.
	 * Then, getForecast() goes to the network for fresh data. If the network
	 * request goes through, then the card gets updated a second time with the
	 * freshest data.
	 */
	app.getForecast = function(key, label) {
	};

	// Iterate all of the cards and attempt to get the latest forecast data
	app.updateForecasts = function() {
		var keys = Object.keys(app.visibleCards);
		keys.forEach(function(key) {
			app.getForecast(key);
		});
	};

	// TODO add saveSelectedCities function here
	// Save list of cities to localStorage.
	app.saveSelectedCities = function() {
		var selectedCities = JSON.stringify(app.selectedCities);
		localStorage.selectedCities = selectedCities;
	};


	var initialBusTicketRecharge = {
		key: '1',
		label: 'Saldo Inicial: 0',
		created: '2018-09-20T00:00:00Z'
	};

	/************************************************************************
	 *
	 * Code required to start the app
	 *
	 * NOTE: To simplify this codelab, we've used localStorage.
	 *	 localStorage is a synchronous API and has serious performance
	 *	 implications. It should not be used in production applications!
	 *	 Instead, check out IDB (https://www.npmjs.com/package/idb) or
	 *	 SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
	 ************************************************************************/

	// TODO add startup code here
	app.selectedCities = localStorage.selectedCities;
	if (app.selectedCities) {
		app.selectedCities = JSON.parse(app.selectedCities);
		app.selectedCities.forEach(function(city) {
			app.getForecast(city.key, city.label);
		});
	} else {
		/* The user is using the app for the first time, or the user has not
		 * saved any cities, so show the user some fake data. A real app in this
		 * scenario could guess the user's location via IP lookup and then inject
		 * that data into the page.
		 */
		app.updateForecastCard(initialBusTicketRecharge);
		app.selectedCities = [
			{key: initialBusTicketRecharge.key, label: initialBusTicketRecharge.label}
		];
		app.saveSelectedCities();
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
						 .register('./service-worker.js')
						 .then(function() { console.log('Service Worker Registered'); });
	}
})();
