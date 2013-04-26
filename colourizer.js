var addedElement = document.createElement('p');
addedElement.appendChild(document.createTextNode('Hello, world!'));

var body = document.body;
body.insertBefore(addedElement, body.firstChild);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "hello") {
    sendResponse({farewell: 'what is this'});
  } else {
    sendResponse({});
  }
});
