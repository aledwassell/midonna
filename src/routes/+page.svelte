<script lang="ts">
	import { onMount } from 'svelte';

	type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

	interface NoteInfo {
		name: string;
		noteName: NoteName;
		octave: number;
	}

	const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	export const NOTE_MAP = new Map<number, NoteInfo>();

	// Generate notes from MIDI 21 (A0) to 108 (C8)
	for (let midiNote = 21; midiNote <= 108; midiNote++) {
		const octave = Math.floor((midiNote - 12) / 12);
		const noteIndex = (midiNote - 12) % 12;
		const noteName = NOTE_NAMES[noteIndex];

		NOTE_MAP.set(midiNote, {
			name: `${noteName}${octave}`,
			noteName,
			octave
		});
	}

	// Helper function to get note info
	export function getNoteInfo(midiNote: number): NoteInfo | undefined {
		return NOTE_MAP.get(midiNote);
	}

	// Helper function to get MIDI note from note name
	export function getMidiNote(noteName: string): number | undefined {
		for (const [midi, info] of NOTE_MAP.entries()) {
			if (info.name === noteName) {
				return midi;
			}
		}
		return undefined;
	}

	let midi = $state<MIDIAccess | null>(null); // global MIDIAccess object
	let midiError = $state<string | null>(null);
	let chosenInputDevice = $state<MIDIInput | null>(null);
	let playedNoteName = $state<NoteName | null>(null);
	$inspect(chosenInputDevice).with((_, value: MIDIInput | null) => {
		if (value) {
			value.onmidimessage = onMIDIMessage;
		}
	});

	function onMIDISuccess(midiAccess: MIDIAccess) {
		console.log('MIDI ready!');
		midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)

		if (midi.inputs.size === 1) {
			chosenInputDevice = midi.inputs.values().next().value as MIDIInput;
		}
	}

	function onMIDIFailure(msg: any) {
		console.error(`Failed to get MIDI access - ${msg}`);
		midiError = `Failed to get MIDI access - ${msg}`;
	}

	function onMIDIMessage(message: MIDIMessageEvent) {
		const data = message.data;
		if (!data) return;
		const cmd = data[0];
		const note = data[1];

		if (cmd === 144) {
			playedNoteName = getNoteInfo(note)?.noteName ?? null;
		}
	}

	onMount(async () => {
		try {
			navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
		} catch (error) {
			console.error('Failed to get MIDI access:', error);
		}
	});
</script>

<div class="flex h-screen w-screen flex-col bg-neutral-700 text-slate-200">
	<header class="flex gap-2 px-2 py-5">
		{#if chosenInputDevice}
			<p class="text-2xl font-bold">
				Chosen input device: <span class="text-fuchsia-400">{chosenInputDevice.name}</span>
			</p>
			<button
				aria-label="Clear chosen input device"
				class="flex cursor-pointer items-center justify-center text-sm text-red-500"
				onclick={() => (chosenInputDevice = null)}
			>
				<span class="gravity-ui--arrow-rotate-left inline-block h-5 w-5"></span>
			</button>
		{:else}
			<div class="flex flex-col justify-center gap-2">
				{#if midi}
					<p>choose your midi input device:</p>
					<ul>
						{#each midi.inputs.values() as input}
							<li>
								<button
									class="cursor-pointer bg-fuchsia-900 text-white"
									onclick={() => (chosenInputDevice = input)}
								>
									Set {input.name} as input device
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p>MIDI not ready!</p>
				{/if}
			</div>
		{/if}
	</header>

	{#if midiError}
		<p class="bg-red-500 text-white">Error: {midiError}</p>
	{/if}

	<div class="flex w-full flex-1 flex-col items-center justify-center gap-2">
		{#if playedNoteName}
			<h1 class="text-9xl font-bold">{playedNoteName}</h1>
		{/if}
	</div>
</div>

<!-- <h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->
