import { sounds, defaultPresets } from './soundData.js';
import { soundManager } from './soundManager.js';
import { UI } from './ui.js';
import { PresetManager } from './presetManager.js';

class AmbientMixer {
	// Init dependencies and default state
	constructor() {
		this.soundManager = new soundManager();
		this.ui = new UI();
		this.presetManager = new PresetManager();
		this.timer = null;
		this.currentSoundState = {};
		this.masterVolume = 100;
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

			// load custom preset
			this._loadCustomPresets();

			this._loadAllSound();

			// init presets sounds
			sounds.forEach((sound) => {
				this.currentSoundState[sound.id] = 0;
			});

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

			//check if deleteBtn
			if (e.target.closest('.delete-preset')) {
				e.stopPropagation();
				const presetId = e.target.closest('.delete-preset').dataset.preset;

				this._deletePreset(presetId);

				if()
				return;
			}

			//default preset btn
			if (e.target.closest('.preset-btn')) {
				const presetKey = e.target.closest('.preset-btn').dataset.preset;
				await this._loadPresetSounds(presetKey);
			}

			if (e.target.closest('.custom-preset-btn')) {
				const presetKey = e.target.closest('.custom-preset-btn').dataset.preset;
				await this._loadPresetSounds(presetKey, true);
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

		//handle master volume slider

		const masterVolumeSlider = document.getElementById('masterVolume');
		if (masterVolumeSlider) {
			masterVolumeSlider.addEventListener('input', (e) => {
				const volumeMaster = parseInt(e.target.value);
				this._setMasterVolume(volumeMaster);
			});
		}

		// handle master play btn
		if (this.ui.playPauseButton) {
			this.ui.playPauseButton.addEventListener('click', () => {
				this._toggleAllSound();
			});
		}

		if (this.ui.resetButton) {
			this.ui.resetButton.addEventListener('click', () => {
				this._resetAll();
			});
		}

		//save Preset btn
		const saveBtn = document.getElementById('savePreset');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				this._showSavePresetModal();
			});
		}

		//cancel Save btn
		const cancelSaveBtn = document.getElementById('cancelSave');
		if (cancelSaveBtn) {
			cancelSaveBtn.addEventListener('click', () => {
				this.ui._hideModal();
			});
		}

		//close modal back drop
		if (this.ui.modal) {
			this.ui.modal.addEventListener('click', (e) => {
				if (e.target === this.ui.modal) {
					this.ui._hideModal();
				}
			});
		}

		// confirm save btn
		const confirmBtn = document.getElementById('confirmSave');
		if (confirmBtn) {
			confirmBtn.addEventListener('click', () => {
				this._saveCurrentPreset();
			});
		}
	}

	// load all sounds files
	_loadAllSound() {
		sounds.forEach((sound) => {
			const audioUrl = `audio/${sound.file}`;
			const success = this.soundManager._loadSound(sound.id, audioUrl);

			if (!success) {
				console.warn(`could not load sound ${sound.name} from ${audioUrl}`);
			}
		});
	}

	async _toggleSound(soundId) {
		const audio = this.soundManager.audioElements.get(soundId);

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

			//set current sound state
			this.currentSoundState[soundId] = volume;

			this.soundManager._setVolume(soundId, volume);
			await this.soundManager._playSound(soundId);

			this.ui._updateSoundPlayBtn(soundId, true);
		} else {
			// if its playing shut it off

			this.soundManager._pauseSound(soundId);
			this.currentSoundState[soundId] = 0;

			this.ui._updateSoundPlayBtn(soundId, false);
			//set current sound state to zero when paused
			this.currentSoundState[soundId] = 0;
		}

		// update main play btn state
		this._updateMainPlayBtnState();
	}
	_toggleAllSound() {
		if (this.soundManager.isPlaying) {
			this.soundManager._pauseAll();
			this.ui._updateMainPlayBtn(false);
			sounds.forEach((sound) => {
				this.ui._updateSoundPlayBtn(sound.id, false);
			});
		} else {
			for (const [soundId, audio] of this.soundManager.audioElements) {
				const card = document.querySelector(`[data-sound="${soundId}"]`);
				const slider = card.querySelector('.volume-slider');
				if (slider) {
					let volume = parseInt(slider.value);

					if (volume === 0) {
						volume = 50;
						slider.value = 50;
						this.ui._updateVolumeDisplay(soundId, volume);
					}

					this.currentSoundState[soundId] = volume;

					const effectiveVolume = (volume * this.masterVolume) / 100;
					audio.volume = effectiveVolume / 100;
					this.ui._updateSoundPlayBtn(soundId, true);
				}
			}

			// play all sounds
			this.soundManager._playAll();
			this.ui._updateMainPlayBtn(true);
		}
	}
	_setSoundVolume(soundId, volume) {
		// set sound volume
		this.currentSoundState[soundId] = volume;

		//calculate effective volume with master volume
		const effectiveVolume = (volume * this.masterVolume) / 100;

		// update visual display
		const audio = this.soundManager.audioElements.get(soundId);

		if (audio) {
			audio.volume = effectiveVolume / 100;
		}
		// update display
		this.ui._updateVolumeDisplay(soundId, volume);

		// sync sound
		this._updateMainPlayBtnState();
	}

	// toggle all sound

	_setMasterVolume(volume) {
		this.masterVolume = volume;

		// update display
		const masterVolumeValue = document.getElementById('masterVolumeValue');
		if (masterVolumeValue) {
			masterVolumeValue.textContent = `${volume}%`;
		}

		// apply master volume to all current playing sound
		this._applyMasterVolumeToAll();
	}

	_applyMasterVolumeToAll() {
		for (const [soundId, audio] of this.soundManager.audioElements) {
			const card = document.querySelector(`[data-sound="${soundId}"]`);
			const slider = card?.querySelector('.volume-slider');
			if (slider) {
				const individualVolume = parseInt(slider.value);
				const effectiveVolume = (individualVolume * this.masterVolume) / 100;
				audio.volume = effectiveVolume / 100;
			}
		}
	}

	//update main play btn on individual sounds
	_updateMainPlayBtnState() {
		//check if any sound is playing
		let anySoundPlaying = false;
		for (const [soundId, audio] of this.soundManager.audioElements) {
			if (!audio.paused) {
				anySoundPlaying = true;
				break;
			}
		}
		//update ui
		this.soundManager.isPlaying = anySoundPlaying;
		this.ui._updateMainPlayBtn(anySoundPlaying);
	}

	//reset everything to default state
	_resetAll() {
		this.soundManager._stopAll();
		this.masterVolume = 100;

		//reset active preset
		this.ui._setActivePreset(null);

		//reset sound state
		sounds.forEach((sound) => {
			this.currentSoundState[sound.id] = 0;
		});

		//reset UI
		this.ui._resetUI();
	}

	_loadPresetSounds(presetKey, custom = false) {
		let preset;

		if (custom) {
			preset = this.presetManager._loadPreset(presetKey);
		} else {
			preset = defaultPresets[presetKey];
		}

		if (!preset) {
			console.error(`Preset: ${presetKey} not found`);
			return;
		}

		//first stop all sounds
		this.soundManager._stopAll();

		//reset all volume to zero
		sounds.forEach((sound) => {
			this.currentSoundState[sound.id] = 0;
			this.ui._updateVolumeDisplay(sound.id, 0);
			this.ui._updateSoundPlayBtn(sound.id, false);
		});

		//apply preset volume
		for (const [soundId, volume] of Object.entries(preset.sounds)) {
			this.currentSoundState[soundId] = volume;
			this.ui._updateVolumeDisplay(soundId, volume);

			// effective Volume

			const effectiveVolume = (volume * this.masterVolume) / 100;

			//get audio element
			const audio = this.soundManager.audioElements.get(soundId);

			if (audio) {
				audio.volume = effectiveVolume / 100;

				audio
					.play()
					.catch((err) => console.error(`Failed to play ${soundId}`, err));
				this.ui._updateSoundPlayBtn(soundId, true);
			}
		}

		//update main btn and state
		this.soundManager.isPlaying = true;
		this.ui._updateMainPlayBtn(true);

		//set active preset
		if (presetKey) {
			this.ui._setActivePreset(presetKey);
		}
	}

	_showSavePresetModal() {
		//check if anySounds are active
		const hasActiveSounds = Object.values(this.currentSoundState).some(
			(volume) => volume > 0,
		);

		if (!hasActiveSounds) {
			alert('No Active sound for Preset!');
			return;
		}

		this.ui._showModal();
	}

	// save current preset
	_saveCurrentPreset() {
		const nameInput = document.getElementById('presetName');
		const name = nameInput.value.trim();

		if (!name) {
			alert(`Please Enter Preset Name!`);
			return;
		}

		if (this.presetManager._presetNameExists(name)) {
			alert(
				`Preset with name: ${name} already exists, please choose a different name!`,
			);
			return;
		}

		const presetId = this.presetManager._savePreset(
			name,
			this.currentSoundState,
		);

		// add custom preset display
		this.ui._addCustomPreset(name, presetId);
		this.ui._hideModal();
	}

	// load custom preset
	_loadCustomPresets() {
		const customPresets = this.presetManager.customPresets;
		for (const [presetId, preset] of Object.entries(customPresets)) {
			this.ui._addCustomPreset(preset.name, presetId);
		}
	}

	_deletePreset(presetId) {
		if (this.presetManager._deleteCustomPreset(presetId)) {
			this.ui._removeCustomPrest(presetId);
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
