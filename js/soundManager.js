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

			return true;
		} catch (error) {}
		console.error(`Failed to load Sound ${soundId}, ${error}`);

		return false;
	}

	// play specific sound
	async _playSound(soundID) {
		const audio = this.audioElements.get(soundID);

		if (audio) {
			try {
				await audio.play();
				this.isPlaying = true;
				return true;
			} catch (error) {
				console.error(`Failed to play ${soundID}`, error);
				return false;
			}
		}
	}

	// pause sound

	_pauseSound(soundID) {
		const audio = this.audioElements.get(soundID);

		if (audio && !audio.paused) {
			try {
				audio.pause();
				this.isPlaying = false;
				return true;
			} catch (error) {
				console.error(`Failed to pause ${soundID}`, error);
				return false;
			}
		}
	}

	//set volume for a specific sound (0 - 100)

	_setVolume(soundID, volume) {
		const audio = this.audioElements.get(soundID);

		if (!audio) {
			console.error(`Sound ${soundID} not found`);
			return false;
		}

		// convert 0-100 to 0 - 1

		audio.volume = volume / 100;
		return true;
	}
}
