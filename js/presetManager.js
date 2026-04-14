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

	// load Custom preset by ID
	_loadPreset(presetId) {
		return this.customPresets[presetId] || null;
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

	//delete from local storage
	_deleteCustomPreset(presetId) {
		if (this.customPresets[presetId]) {
			delete this.customPresets[presetId];
			this._saveCustomPresets();
			return true;
		}
		return false;
	}
}
