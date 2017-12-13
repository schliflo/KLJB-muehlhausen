'use strict';
(function() {
  const fbEventsUrl = 'https://kljb-events-proxy.schliflo.de/fb-page-events.php?fields=description,end_time,id,name,place,start_time,cover';
  const classHidden = 'hidden';
  const classOpen = 'open';
  const eventListUpcoming = document.querySelector('ul.event-list#upcoming');
  const eventListPast = document.querySelector('ul.event-list#past');
  const headlineUpcoming = document.querySelector('#headline-upcoming');
  const messageUpcoming = document.querySelector('#message-upcoming');
  const headlinePast = document.querySelector('#headline-past');
  const messagePast = document.querySelector('#message-past');
  const currentDate = new Date();

  fetch(fbEventsUrl).then(function(response) {
    let contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    throw new TypeError('Oops, we haven\'t got JSON!');
  }).then(function(json) {
    let upcomingEvents = [];
    let pastEvents = [];

    for (let i = 0; i < json.data.length; i++) {
      let eventDate = new Date(getInterOperableDateString(json.data[i].start_time));
      if (eventDate >= currentDate) {
        upcomingEvents.push({
          date: eventDate,
          data: json.data[i]
        });
      } else {
        pastEvents.push({
          date: eventDate,
          data: json.data[i]
        });
      }
    }

    displayEvents(eventListUpcoming, upcomingEvents, headlineUpcoming, messageUpcoming, true);
    displayEvents(eventListPast, pastEvents, headlinePast, messagePast, upcomingEvents.length === 0);
  });

  // returns a formatted date string which works cross browsers (I'm looking at you, Safari)
  function getInterOperableDateString(dateString) {
    return dateString.replace(/-/g, '/').replace('T', ' ').replace(/\..*|\+.*/, "");
  }

  function displayEvents(list, events, headline, message, open) {
    headline.classList.remove(classHidden);
    if (list && events.length) {
      list.classList.remove(classHidden);
      for (let i = 0; i < events.length; i++) {
        list.appendChild(getEventElement(events[i]));
      }
    } else {
      message.classList.remove(classHidden);
    }
    if (open) {
      list.classList.add(classOpen);
      headline.classList.add(classOpen);
    }
  }

  function getEventElement(event) {
    let item = document.createElement('li');
    let link = document.createElement('a');
    let image = document.createElement('div');
    let title = document.createElement('h3');
    let date = document.createElement('span');

    item.classList.add('event');
    link.href = 'https://www.facebook.com/events/' + event.data.id;
    link.rel = 'noopener';
    link.target = '_blank';
    image.classList.add('event--image');
    image.style.backgroundImage = 'url(' + event.data.cover.source + ')';
    title.classList.add('event--title');
    title.innerText = event.data.name;
    date.classList.add('event--date');
    date.innerText = event.date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      minute: '2-digit',
      hour: '2-digit'
    });

    link.appendChild(image);
    link.appendChild(title);
    link.appendChild(date);
    item.appendChild(link);

    return item;
  }

  headlineUpcoming.addEventListener('click', function() {
    headlineUpcoming.classList.toggle(classOpen);
    eventListUpcoming.classList.toggle(classOpen);
  });

  headlinePast.addEventListener('click', function() {
    headlinePast.classList.toggle(classOpen);
    eventListPast.classList.toggle(classOpen);
  });
}());
