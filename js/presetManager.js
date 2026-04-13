export class PresetManager {
	constructor() {
		this.customPresets = this._loadCustomPresets();
	}

	_loadCustomPresets() {
		const stored = localStorage.getItem('ambientMixerPresets');
		return stored ? JSON.parse(stored) : {};
	}

	// save custom
	_saveCustomPresets() {
		localStorage.setItem(
			'ambientMixerPresets',
			JSON.stringify(this.customPresets),
		);
	}

	_savePreset(name, soundState) {
		const presetId = crypto.randomUUID();

		//create preset with active sounds
		const preset = {
			name,
			sounds: {},
		};

		for (const [soundId, volume] of Object.entries(soundState)) {
			if (volume > 0) {
				preset.sounds[soundId] = volume;
			}
		}

		this.customPresets[presetId] = preset;
		this._saveCustomPresets();
		return presetId;
	}

	// check if name already exists
	_presetNameExists(name) {
		return Object.values(this.customPresets).some(
			(preset) => preset.name === name,
		);
	}
}
