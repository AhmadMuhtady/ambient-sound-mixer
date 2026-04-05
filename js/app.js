import { sounds, defaultPresets } from './soundData.js';

class AmbientMixer {
	// Init dependencies and default state
	constructor() {
		console.log('Init State ....');
		this.soundManger = null;
		this.ui = null;
		this.presetManager = null;
		this.timer = null;
		this.currentSoundState = {};
		this.isInitialized = false;
	}

	_init() {
		try {
			console.log('initializing app...');
			this.isInitialized = true;
		} catch (error) {
			console.error(`Failed to initialize app , ${error}`);
		}
	}
}

//init app when dom is loaded!!
document.addEventListener('DOMContentLoaded', () => {
	const app = new AmbientMixer();
	app._init();
});
