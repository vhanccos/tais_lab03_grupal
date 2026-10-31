export type WhistleMode = 'off' | 'continuous' | 'rule_of_three';

export interface WhistleState {
  isActive: boolean;
  mode: WhistleMode;
  currentBlastIndex?: number;
}

export class RescueAudioWhistle {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private currentMode: WhistleMode = 'off';
  private frequency: number = 3000; // 3000 Hz (human ear peak sensitivity 2500-3500 Hz)
  private stateListener?: (state: WhistleState) => void;

  constructor(frequency: number = 3000) {
    this.frequency = Math.max(2500, Math.min(3500, frequency));
  }

  public setListener(listener: (state: WhistleState) => void) {
    this.stateListener = listener;
  }

  private notify(mode: WhistleMode, isActive: boolean, currentBlastIndex?: number) {
    this.currentMode = mode;
    if (this.stateListener) {
      this.stateListener({ isActive, mode, currentBlastIndex });
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private startTone() {
    try {
      const ctx = this.getAudioContext();
      this.stopTone(); // Clean prior if active

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Penetrating harmonic content
      osc.frequency.setValueAtTime(this.frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.oscillator = osc;
      this.gainNode = gain;
    } catch (e) {
      console.warn('No se pudo iniciar el oscilador de audio:', e);
    }
  }

  private stopTone() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch {
      // Ignorar errores al desconectar nodos detenidos
    }
  }

  public startContinuous() {
    this.stop();
    this.notify('continuous', true);
    this.startTone();
  }

  /**
   * Código Internacional "Regla de Tres" (Poder del Tres):
   * 3 pitidos de 1 segundo con 1 segundo de intervalo.
   * Silencio de 60 segundos para escuchar a los rescatistas.
   * Repite indefinidamente.
   */
  public startRuleOfThree() {
    this.stop();
    this.notify('rule_of_three', true, 1);

    const runSequence = () => {
      // Blast 1
      this.notify('rule_of_three', true, 1);
      this.startTone();

      this.loopTimer = setTimeout(() => {
        this.stopTone();

        // Gap 1s
        this.loopTimer = setTimeout(() => {
          // Blast 2
          this.notify('rule_of_three', true, 2);
          this.startTone();

          this.loopTimer = setTimeout(() => {
            this.stopTone();

            // Gap 1s
            this.loopTimer = setTimeout(() => {
              // Blast 3
              this.notify('rule_of_three', true, 3);
              this.startTone();

              this.loopTimer = setTimeout(() => {
                this.stopTone();
                this.notify('rule_of_three', true, 0); // Listening window

                // 60 seconds listening window (testable, can loop)
                this.loopTimer = setTimeout(() => {
                  if (this.currentMode === 'rule_of_three') {
                    runSequence();
                  }
                }, 60000);
              }, 1000); // Blast 3 duration: 1s
            }, 1000); // Gap 2 duration: 1s
          }, 1000); // Blast 2 duration: 1s
        }, 1000); // Gap 1 duration: 1s
      }, 1000); // Blast 1 duration: 1s
    };

    runSequence();
  }

  public stop() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.stopTone();
    this.notify('off', false);
  }

  public getMode(): WhistleMode {
    return this.currentMode;
  }
}
