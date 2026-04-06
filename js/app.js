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
			this.soundManger._setVolume(soundId, 50);
			await this.soundManger._playSound(soundId);

			//@to-do update sound btn
			this.ui._updateSoundPlayBtn(soundId, this.soundManger.isPlaying);
		} else {
			// if its playing shut it off
			this.soundManger._pauseSound(soundId);

			//to-do update play btn
			this.ui._updateSoundPlayBtn(soundId, this.soundManger.isPlaying);
		}
	}
}

//init app when dom is loaded!!
document.addEventListener('DOMContentLoaded', () => {
	const app = new AmbientMixer();
	app._init();

	// make app global for testing
	window.app = app;
});
