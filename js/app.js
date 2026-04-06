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

			this._loadAllSound();
			this.isInitialized = true;
		} catch (error) {
			console.error(`Failed to initialize app , ${error}`);
		}
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
}

//init app when dom is loaded!!
document.addEventListener('DOMContentLoaded', () => {
	const app = new AmbientMixer();
	app._init();

	// make app global for testing
	window.app = app;
});
