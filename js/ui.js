export class UI {
	constructor() {
		this.soundCardsContainer = null;
		this.masterVolumeSlider = null;
		this.masterVolumeValue = null;
		this.playPauseButton = null;
		this.resetButton = null;
		this.modal = null;
		this.customPresetsContainer = null;
		this.timerDisplay = null;
		this.timerSelect = null;
		this.themeToggle = null;
	}

	_init() {
		this.soundCardsContainer = document.querySelector('.grid');
		this.masterVolumeSlider = document.getElementById('masterVolume');
		this.masterVolumeValue = document.getElementById('masterVolumeValue');
		this.playPauseButton = document.getElementById('playPauseAll');
		this.resetButton = document.getElementById('resetAll');
		this.modal = document.getElementById('savePresetModal');
		this.customPresetsContainer = document.getElementById('customPresets');
		this.timerDisplay = document.getElementById('timerDisplay');
		this.timerSelect = document.getElementById('timerSelect');
		this.themeToggle = document.getElementById('themeToggle');
	}

	// Create sound card HTML
	_createSoundCard(sound) {
		const card = document.createElement('div');
		card.className =
			'sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300';
		card.dataset.sound = sound.id;

		card.innerHTML = ` <div class="flex flex-col h-full">
      <!-- Sound Icon and Name -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
            <i class="fas ${sound.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">${sound.name}</h3>
            <p class="text-xs opacity-70">${sound.description}</p>
          </div>
        </div>
        <button type="button" class="play-btn w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
          <i class="fas fa-play text-sm"></i>
        </button>
      </div>

      <!-- Volume Control -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center space-x-3">
          <i class="fas fa-volume-low opacity-50"></i>
          <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}">
          <span class="volume-value text-sm w-8 text-right">0</span>
        </div>

        <!-- Volume Bar Visualization -->
        <div class="volume-bar mt-3">
          <div class="volume-bar-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>`;

		return card;
	}

	// create custom preset btn
	_createCustomPresetBtn(name, presetId) {
		const presetBtn = document.createElement('button');
		presetBtn.className =
			'custom-preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group';
		presetBtn.dataset.preset = presetId;
		presetBtn.innerHTML = `  <i class="fas fa-star mr-2 text-yellow-400"></i>
    ${name}
    <button type="button" class="delete-preset absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-preset="${presetId}">
      <i class="fas fa-times text-xs text-white"></i>
    </button>`;

		return presetBtn;
	}

	_renderSoundCards(sounds) {
		this.soundCardsContainer.innerHTML = '';
		sounds.forEach((sound) => {
			const card = this._createSoundCard(sound);
			this.soundCardsContainer.appendChild(card);
		});
	}

	// update play/pause btn for individual sound
	_updateSoundPlayBtn(soundID, isPlaying) {
		const card = document.querySelector(`[data-sound="${soundID}"]`);

		if (card) {
			const playBtn = card.querySelector('.play-btn');
			const btnIcon = playBtn.querySelector('i');

			if (isPlaying) {
				btnIcon.classList.remove('fa-play');
				btnIcon.classList.add('fa-pause');
				card.classList.add('playing');
			} else {
				btnIcon.classList.remove('fa-pause');
				btnIcon.classList.add('fa-play');
				card.classList.remove('playing');
			}
		}
	}

	_updateVolumeDisplay(soundId, volume) {
		const card = document.querySelector(`[data-sound="${soundId}"]`);

		if (card) {
			const volumeValue = card.querySelector('.volume-value');
			if (volumeValue) volumeValue.textContent = volume;

			const volumeBarVisual = card.querySelector('.volume-bar-fill');
			if (volumeBarVisual) volumeBarVisual.style.width = `${volume}%`;

			const slider = card.querySelector('.volume-slider'); // ✅ inside guard
			if (slider) slider.value = volume;
		}
	}

	_updateMainPlayBtn(isPlaying) {
		if (!this.playPauseButton) return;
		const icon = this.playPauseButton.querySelector('i');

		if (isPlaying) {
			icon.classList.remove('fa-play');
			icon.classList.add('fa-pause');
		} else {
			icon.classList.remove('fa-pause');
			icon.classList.add('fa-play');
		}
	}

	_resetUI() {
		//reset slider to zero
		const sliders = document.querySelectorAll('.volume-slider');
		sliders.forEach((slider) => {
			slider.value = 0;
			const soundId = slider.dataset.sound;
			this._updateVolumeDisplay(soundId, 0);
		});

		//reset all play btn
		const playBtn = document.querySelectorAll('.play-btn');
		playBtn.forEach((btn) => {
			if (!btn) return;
			const icon = btn.querySelector('i');
			icon.classList.remove('fa-pause');
			icon.classList.add('fa-play');
		});
		const cards = document.querySelectorAll('.sound-card');
		cards.forEach((card) => {
			card.classList.remove('playing');
		});

		this._updateMainPlayBtn(false);
		this.masterVolumeSlider.value = 100;
		this.masterVolumeValue.textContent = '100%';
	}

	// showModal
	_showModal() {
		this.modal.classList.remove('hidden');
		this.modal.classList.add('flex');
		document.getElementById('presetName').focus();
	}

	_hideModal() {
		this.modal.classList.remove('flex');
		this.modal.classList.add('hidden');
		document.getElementById('presetName').value = '';
	}

	//add custom preset to ui
	_addCustomPreset(name, presetId) {
		const presetBtn = this._createCustomPresetBtn(name, presetId);
		this.customPresetsContainer.appendChild(presetBtn);
	}

	//highlight active preset
	_setActivePreset(presetId) {
		//Remove active class from all btns
		document
			.querySelectorAll('.preset-btn, .custom-preset-btn')
			.forEach((btn) => {
				btn.classList.remove('preset-active');
			});

		// add active class active
		const activeBtn = document.querySelector(
			`.preset-btn[data-preset="${presetId}"], .custom-preset-btn[data-preset="${presetId}"]`,
		);

		if (activeBtn) {
			activeBtn.classList.add('preset-active');
		}
	}

	_removeCustomPrest(presetId) {
		const btn = document.querySelector(
			`.custom-preset-btn[data-preset="${presetId}"]`,
		);

		if (btn) {
			btn.remove();
		}
	}

	_updateTimerDisplay(minutes, seconds) {
		if (this.timerDisplay) {
			if (minutes > 0 || seconds > 0) {
				const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
				this.timerDisplay.textContent = formattedTime;
				this.timerDisplay.classList.remove('hidden');
			} else {
				this.timerDisplay.classList.add('hidden');
			}
		}
	}
}
