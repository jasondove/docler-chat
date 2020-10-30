class DoclerChat {
	socket = io();
	storageKey = 'doclerchatsettings';
	$settingsButton;
	$settingsModal;
	$settingsForm;
	$settingsFormClose;
	$settingsFormNameText;
	$settingsFormNameButton;
	$settingsFormTimeButtons
	$resetSettings;
	$headerName;
	$convo;
	$form;
	$formText;
	settingsDefault = {
		name: 'Human',
		use12HrTime: true,
		ctrlEnterSend: true
	};
	settings = {};
	msgs = [];

	constructor() {
		this.bindElements();
		this.bindEvents();
		this.loadSettings();
	}

	// Grab our html elements. This makes me miss using frameworks.
	bindElements() {
		this.$settingsButton = document.querySelector('.settings-button');
		this.$settingsModal = document.querySelector('.settings-modal');
		this.$settingsForm = document.querySelector('.settings-form');
		this.$settingsFormClose = document.querySelector('.settings-form__close-button');
		this.$settingsFormNameText = document.querySelector('.settings-form__name-text');
		this.$settingsFormNameButton = document.querySelector('.settings-form__name-button');
		this.$settingsFormTimeButtons = document.getElementsByClassName('radio-time');
		this.$settingsFormSubmitButtons = document.getElementsByClassName('radio-submit');
		this.$resetSettings = document.querySelector('.reset-settings');
		this.$headerName = document.querySelector('.header-name');
		this.$convo = document.querySelector('.convo-msgs');
		this.$form = document.querySelector('.msg-form');
		this.$formText = document.querySelector('.msg-form__text');
	}

	bindEvents() {
		// Message form submission (we're sending a message)
		this.$form.onsubmit = (e) => {
			e.preventDefault();
			this.submitForm();
		};

		// Prevent message form submission on Enter press, optionally allow it for Ctrl|Cmd + Enter
		this.$form.onkeypress = (e) => {
			if (e.code === 'Enter') {
				e.preventDefault();
			}

			const allowCtrlEnter = this.settings.ctrlEnterSend;
			if (allowCtrlEnter && (e.ctrlKey || e.metaKey) && e.code === 'Enter') {
				this.submitForm();
			}
		};

		// Toggle settings display
		this.$settingsButton.onclick = () => {
			this.$settingsModal.classList.toggle('visible');
		};
		this.$settingsModal.onclick = () => {
			this.$settingsModal.classList.toggle('visible');
		};
		this.$settingsFormClose.onclick = () => {
			this.$settingsModal.classList.toggle('visible');
		};
		this.$settingsForm.onclick = (e) => {
			e.stopPropagation();
		};

		// Settings - change name
		this.$settingsFormNameButton.onclick = () => {
			this.setNameSetting(this.$settingsFormNameText.value.trim());
			this.$settingsFormNameText.value = '';
			this.saveSettingsToStorage();
			this.reRenderMessages();
		};

		// Settings - change time display
		const timeButtonsClick = ({target}) => {
			this.setTimeSetting(target.value === "1");
			this.saveSettingsToStorage();
			this.reRenderMessages();
		}
		let len = this.$settingsFormTimeButtons.length;
		for (let i = 0; i < len; i++) {
			this.$settingsFormTimeButtons[i].onclick = timeButtonsClick.bind(this);
		}

		// Settings - change Ctrl|Cmd + Enter message submit
		const submitButtonsClick = ({target}) => {
			this.setSubmitSetting(target.value === "1");
			this.saveSettingsToStorage();
			this.reRenderMessages();
		}
		len = this.$settingsFormSubmitButtons.length;
		for (let i = 0; i < len; i++) {
			this.$settingsFormSubmitButtons[i].onclick = submitButtonsClick.bind(this);
		}

		// Settings - reset to defaults
		this.$resetSettings.onclick = () => {
			this.resetSettings();
		};

		// New incoming message from the server
		this.socket.on('serverMsg', this.handleNewMessage.bind(this));
	}

	saveSettingsToStorage() {
		if (typeof localStorage !== 'object') {
			return;
		}

		localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
	}

	loadSettings() {
		const settings = typeof localStorage === 'object' ?
			JSON.parse(localStorage.getItem(this.storageKey)) || {} :
			this.settingsDefault;

		// Set name setting
		this.setNameSetting(
			settings.hasOwnProperty('name') && typeof settings.name === 'string' ?
			settings.name :
			this.settingsDefault.name
		);

		// Set time setting and check the appropriate radio button
		this.setTimeSetting(
			settings.hasOwnProperty('use12HrTime') && typeof settings.use12HrTime === 'boolean' ?
			settings.use12HrTime :
			this.settingsDefault.use12HrTime
		);
		let val = this.settings.use12HrTime ? "1" : "0";
		let len = this.$settingsFormTimeButtons.length;
		for (let i = 0; i < len; i++) {
			if (this.$settingsFormTimeButtons[i].value === val) {
				this.$settingsFormTimeButtons[i].checked = true;
				break;
			}
		}

		// Set submit setting and check the appropriate radio button
		this.setSubmitSetting(
			settings.hasOwnProperty('ctrlEnterSend') && typeof settings.ctrlEnterSend === 'boolean' ?
			settings.ctrlEnterSend :
			this.settingsDefault.ctrlEnterSend
		);
		val = this.settings.ctrlEnterSend ? "1" : "0";
		len = this.$settingsFormSubmitButtons.length;
		for (let i = 0; i < len; i++) {
			if (this.$settingsFormSubmitButtons[i].value === val) {
				this.$settingsFormSubmitButtons[i].checked = true;
				break;
			}
		}
	}

	resetSettings() {
		if (typeof localStorage === 'object') {
			localStorage.removeItem(this.storageKey);
		}
		this.loadSettings();
		this.reRenderMessages();
	}

	setNameSetting(name) {
		if (!name || typeof name !== 'string') {
			return;
		}
		name = name.substring(0, 20);
		this.$headerName.innerText = name;

		const len = this.msgs.length;
		for (let i = 0; i < len; i++) {
			if (this.msgs[i].name === this.settings.name) {
				this.msgs[i].name = name;
			}
		}
		this.settings.name = name;
	}

	setTimeSetting(use12HrTime) {
		if (typeof use12HrTime !== 'boolean') {
			return;
		}
		this.settings.use12HrTime = use12HrTime;
	}

	setSubmitSetting(ctrlEnterSend) {
		if (typeof ctrlEnterSend !== 'boolean') {
			return;
		}
		this.settings.ctrlEnterSend = ctrlEnterSend;
	}

	reRenderMessages() {
		this.$convo.innerHTML = '';
		const len = this.msgs.length;
		for (let i = 0; i < len; i++) {
			this.showMessage(this.msgs[i]);
		}
	}

	submitForm() {
		const text = this.$formText.value.trim();
		if (!text) {
			return;
		}

		const messageData = {
			name: this.settings.name,
			time: Date.now(),
			text: text
		};
		this.socket.emit('clientMsg', messageData);
		messageData.is_me = true;
		this.$formText.value = '';
		this.msgs.push(messageData);
		this.showMessage(messageData);
	}

	handleNewMessage(data) {
		this.msgs.push(data);
		this.showMessage(data);
	}

	showMessage(data) {
		// Set up the date string based on locale, when message was sent, and 12|24 hour display settings
		const sent = new Date(data.time);
		let dateString = '';
		if (new Date(Date.now()).toLocaleDateString() !== sent.toLocaleDateString()) {
			dateString += sent.toLocaleDateString() + ' ';
		}
		dateString += sent.toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: this.settings.use12HrTime
		});

		// Create the message element and append it to the DOM
		this.getImgOrSpan(data.text).then((el) => {
			const msgContent = document.createElement('div');
			msgContent.classList.add('msg-main');
			msgContent.appendChild(el);

			const msgMeta = document.createElement('div');
			msgMeta.classList.add('msg-meta');
			msgMeta.appendChild(document.createTextNode(
				`${data.name} - ${dateString}`
			));

			const msg = document.createElement('div');
			const myName = this.settings.name
			msg.classList.add('msg');
			msg.classList.add(`${data.is_me ? 'msg_me' : 'msg_them'}`);
			msg.appendChild(msgContent);
			msg.appendChild(msgMeta);
			this.$convo.appendChild(msg);
			this.$convo.scrollTop = this.$convo.scrollHeight;
		});
	}

	// Automagically show images if they're a valid link, or otherwise just wrap the text in a span
	getImgOrSpan(string) {
		function getSpan() {
			const el = document.createElement('span');
			el.classList.add('msg-text');
			el.appendChild(document.createTextNode(string));
			return el;
		}

		const httpTest = /^(http|https)/;
		if (!httpTest.test(string)) {
			return Promise.resolve(getSpan(string));
		}

		const img = new Image();
		return new Promise((resolve) => {
			img.onload = () => {
				const el = document.createElement('img');
				el.classList.add('msg-img');
				el.src = string;
				resolve(el);
			};
			img.onerror = () => {
				img.onerror = null;
				resolve(getSpan(string));
			};
			// onerror can take a while to trigger, so let's bail after a second
			setTimeout(() => {
				resolve(getSpan(string));
			}, 1000);

			img.src = string;
		});
	}
}

window.onload = () => {
	new DoclerChat();
};
