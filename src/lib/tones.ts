// src/lib/tones.ts
import { browser } from '$app/environment';
import { start, Synth } from 'tone';

let synth: InstanceType<typeof Synth> | null = null;

function getSynth() {
	if (!synth) {
		synth = new Synth({
			oscillator: { type: 'triangle' },
			envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.5 }
		});
		synth.toDestination();
	}
	return synth;
}

export async function playNote(note: string) {
	if (!browser) return; // guard: never run on server
	await start();
	getSynth().triggerAttackRelease(note, '8n');
}
