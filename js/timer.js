export class Timer {
	constructor(onComplete, onTick) {
		this.duration = 0;
		this.remaining = 0;
		this.intervalId = null;
		this.onComplete = onComplete;
		this.onTick = onTick;
		this.isRunning = false;
	}

	//start timer with duration in minutes
	_start(minutes) {
		if (minutes <= 0) {
			this._stop();
			return; // ✅
		}

		this.duration = minutes * 60; //convert to seconds
		this.remaining = this.duration;
		this.isRunning = true;

		// clear any existing interval
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}

		//update display
		this._updateDisplay();

		//start countdown
		this.intervalId = setInterval(() => {
			this.remaining--;
			this._updateDisplay();

			if (this.remaining <= 0) {
				this._complete();
			}
		}, 1000);
	}

	_stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		this.duration = 0;

		this.remaining = 0;
		this.isRunning = false;
		this._updateDisplay();
	}

	_complete() {
		this._stop();

		if (this.onComplete) {
			this.onComplete();
		}
	}

	//updateDisplay
	_updateDisplay() {
		const minutes = Math.floor(this.remaining / 60);
		const seconds = this.remaining % 60;

		if (this.onTick) {
			this.onTick(minutes, seconds);
		}
	}
}
