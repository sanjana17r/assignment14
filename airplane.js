(function() {
    'use strict';
  
    var app = {
      isLoading: true,
      visibleCards: {},
      selectedCities: [],
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
  
    document.getElementById('butRefresh').addEventListener('click', function() {
      // Refresh all of the forecasts
      app.updateSchedule();
    });
  
    document.getElementById('butAdd').addEventListener('click', function() {
      // Open/show the add new city dialog
      app.toggleAddDialog(true);
      
    });
  
    document.getElementById('butAddFlight').addEventListener('click', function() {
      // Add the newly selected city
      var select = document.getElementById('selectFlightToAdd');
      var selected = select.options[select.selectedIndex];
      var key = selected.value;
      var label = selected.textContent;
      // TODO init the app.selectedCities array here
      if (!app.selectedFlights) {
        app.selectedCities = [];
      }
      app.getSchedule(key, label);
      // TODO push the selected city to the array and save here
      app.selectedFlights.push({key: key, label: label});
      app.saveSelectedFlights();
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
  app.updateFlightCard = function(data) {
    var dataLastUpdated = new Date(data.created);
    var time = data.channel.astronomy.time;
    var status = data.channel.astronomy.status;
    var current = data.channel;

    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
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
      cardLastUpdated = new time(cardLastUpdated);
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;

    card.querySelector('.time').textContent = current.time;
    card.querySelector('.status').textContent = current.status;

    
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }


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
  app.getSchedule = function(key, label) {
    // TODO add cache logic here

    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          results.key = key;
          results.label = label;
          results.created = response.query.created;
          app.updateFlightCard(results); 
        }
      } else {
        // Return the initial weather forecast since no data is available.
        app.updateFlightCard(initialSchedule);
      }
    };
    request.open('GET', "flightschedule.json",true);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateSchedule = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
       app.getSchedule(key);
    });
  };

  // TODO add saveSelectedCities function here
// Save list of flights to localStorage.
app.saveSelectedFlights = function() {
  var selectedFlights = JSON.stringify(app.selectedFlights);
  localStorage.selectedFlights = selectedFlights;
};

  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */
  var initialSchedule = {
    key: '2459115',
    label: 'Malta to Amsterdam',
    created: '2016-07-22T01:00:00Z',
    channel: {
      astronomy: {
        time: "5:43 am"
      },
      },
    }
  
  // TODO uncomment line below to test app with fake data
  app.updateSchedule(initialSchedule);

  // TODO add startup code here
  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/

  app.selectedFlights = localStorage.selectedFlights;
  if (app.selectedFlights) {
    app.selectedFlights = JSON.parse(app.selectedFlights);
    app.selectedFlights.forEach(function(flight) {
      app.getSchedule(light.key, light.label);
    });
  } else {
    /* The user is using the app for the first time, or the user has not
     * saved any cities, so show the user some fake data. A real app in this
     * scenario could guess the user's location via IP lookup and then inject
     * that data into the page.
     */
    app.updateSchedule(initialSchedule);
    app.selectedFlights = [
      {key: initialSchedule.key, label: initialSchedule.label}
    ];
    app.saveSelectedFlights();
  }

  // service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./s-w.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();