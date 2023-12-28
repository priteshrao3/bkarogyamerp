importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-messaging.js');
const config = {};
fetch('/firebase.json') // Call the fetch function passing the url of the API as a parameter
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${  response.status}`);
        }
        return response.json();
    })
    .then(json => {
        firebase.initializeApp(json.config);
        const messaging = firebase.messaging();
    })
    .catch(function() {
        // This is where you run code if the server returns any errors
    });


