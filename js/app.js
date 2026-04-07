import { sounds, defaultPresets } from './soundData.js';
import { soundManger } from './soundManager.js';
import { UI } from './ui.js';

class AmbientMixer {
	// Init dependencies and default state
	constructor() {
		this.soundManger = new soundManger();
		this.ui = new UI();
		this.presetManager = null;
		this.timer = null;
		this.currentSoundState = {};
		this.isInitialized = false;
	}

	_init() {
		try {
			// init soundUI
			this.ui._init();

			// render sound data
			this.ui._renderSoundCards(sounds);

			//calling all event listeners

			this._setupAllEventListener();

			this._loadAllSound();
			this.isInitialized = true;
		} catch (error) {
			console.error(`Failed to initialize app , ${error}`);
		}
	}

	_setupAllEventListener() {
		document.addEventListener('click', async (e) => {
			if (e.target.closest('.play-btn')) {
				const soundId = e.target.closest('.play-btn').dataset.sound;
				await this._toggleSound(soundId);
			}
		});

		//handle volume slider changes
		document.addEventListener('input', (e) => {
			if (e.target.classList.contains('volume-slider')) {
				const soundId = e.target.dataset.sound;
				const volume = parseInt(e.target.value);
				this._setSoundVolume(soundId, volume);
			}
		});
	}

	// load all sounds files
	_loadAllSound() {
		sounds.forEach((sound) => {
			const audioUrl = `audio/${sound.file}`;
			const success = this.soundManger._loadSound(sound.id, audioUrl);

			if (!success) {
				console.warn(`could not load sound ${sound.name} from ${audioUrl}`);
			}
		});
	}

	async _toggleSound(soundId) {
		const audio = this.soundManger.audioElements.get(soundId);

		if (!audio) {
			console.error(`Sound: ${soundId} is not found`);
			return false;
		}

		if (audio.paused) {
			// get current slider value
			const card = document.querySelector(`[data-sound="${soundId}"]`);
			const slider = card.querySelector('.volume-slider');
			let volume = parseInt(slider.value);

			//if slider at 0 default at 50%
			if (volume === 0) {
				volume = 50;
				this.ui._updateVolumeDisplay(soundId, volume);
			}

			this.soundManger._setVolume(soundId, volume);
			await this.soundManger._playSound(soundId);

			this.ui._updateSoundPlayBtn(soundId, this.soundManger.isPlaying);
		} else {
			// if its playing shut it off
			this.soundManger._pauseSound(soundId);

			this.ui._updateSoundPlayBtn(soundId, this.soundManger.isPlaying);
		}
	}

	_setSoundVolume(soundId, volume) {
		// update sound volume in sound manager
		this.soundManger._setVolume(soundId, volume);

		// update display
		this.ui._updateVolumeDisplay(soundId, volume);
	}
}

//init app when dom is loaded!!
document.addEventListener('DOMContentLoaded', () => {
	const app = new AmbientMixer();
	app._init();

	// make app global for testing
	window.app = app;
});
