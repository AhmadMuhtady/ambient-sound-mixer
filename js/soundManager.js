export class soundManger {
	constructor() {
		this.audioElements = new Map();
		this.isPlaying = false;
		console.log(`sound manager ON`);
	}

	//load a sound
	_loadSound(soundId, filePath) {
		try {
			const audio = new Audio();
			audio.src = filePath;
			audio.loop = true;
			audio.preload = 'metadata';

			// add sound to audio EL map
			this.audioElements.set(soundId, audio);

			this.isPlaying = true;

			return true;
		} catch (error) {}
		console.error(`Failed to load Sound ${soundId}, ${error}`);

		return false;
	}
}
