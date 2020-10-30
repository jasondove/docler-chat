const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const botName = 'TerribleChatBot';

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

function getRandomMessage() {
	const msgs = [
		'That\'s very interesting.',
		'I see.',
		'Do go on!',
		'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260'
	];
	const randomIndex = Math.floor(Math.random() * Math.floor(msgs.length));

	return {
		name: botName,
		time: Date.now(),
		text: msgs[randomIndex]
	};
}

io.on('connection', (socket) => {
	setTimeout(() => {
		socket.emit('serverMsg', {
			name: botName,
			time: Date.now(),
			text: 'Hi there! Welcome to DoclerChat.'
		});
	}, 1000);

	socket.on('clientMsg', (data) => {
		// In real life we'd do something fun with the data here.
		setTimeout(() => {
			socket.emit('serverMsg', getRandomMessage());
		}, 1000);
	});
});

http.listen(3000);
