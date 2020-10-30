# docler-chat

## Overview
Hi. Docler-chat is a simple chat application that consists of a socket.io
server running on the backend. The front end is plain javascript, html, and css.
The working should be fairly self-explanatory—simply type something into the
chat box at the bottom and either click "send" or hit Ctrl or Cmd + Enter to send.

Here's the required features:

- [x] List messages, with yours on the right and theirs on the left
- [x] Messages display time sent
- [x] Input field for typing and sending message
- [x] Messages that are image urls will display the image
- [x] A settings modal that allows you to change name, time format, Ctrl|Cmd + Enter to send, and a reset to defaults
- [x] Settings are stored in localstorage, if available
- [x] Responsive, not entirely hideous appearance (for a developer)

Here's some bonus features:
- [x] The chatbot talks back! It might even send an image.
- [x] Message time sent will also display the date in local format if the message wasn't sent today
- [x] Included a favicon to make it look nice
- [x] Still works without localstorage
- [ ] Bakes cookies (not yet implemented)

## Getting Started
Clone this repo:
```
git clone https://github.com/jasondove/docler-chat
```
Hop in your new directory:
```
cd docler-chat
```
Make sure you have node and npm (if not, install them now):
```
node -v
npm -v
```
Install express and socket.io:
```
npm install express socket.io
```
Start the node server:
```
node index.js
```
Navigate to [http://localhost:3000/](http://localhost:3000/) and have fun!
