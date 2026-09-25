<script lang="ts">
	import { onMount } from 'svelte';
	import { Note, Chord } from 'tonal';
	import Keyboard from '$lib/components/Keyboard.svelte';

	let midi = $state<MIDIAccess | null>(null); // global MIDIAccess object
	let midiError = $state<string | null>(null);
	let chosenInputDevice = $state<MIDIInput | null>(null);
	let midiNotes = $state<number[]>([]);
	let notes = $state<string[]>([]);
	let chords = $state<string[]>([]);

	$effect(() => {
		if (chosenInputDevice) {
			chosenInputDevice.onmidimessage = onMIDIMessage;
		}
	});

	function onMIDISuccess(access: MIDIAccess) {
		midi = access; // store in the global (in real usage, would probably keep in an object instance)

		if (midi.inputs.size === 1) {
			chosenInputDevice = midi.inputs.values().next().value as MIDIInput;
		}

		access.onstatechange = (event) => {
			console.info(`${event.port.manufacturer}: ${event.port.name} ${event.port.state}`);
		};
	}

	function onMIDIFailure(access: MIDIAccess) {
		console.error(`Failed to get MIDI access - ${access}`);
		midiError = `Failed to get MIDI access - ${access}`;
	}

	function onMIDIMessage(message: MIDIMessageEvent) {
		const data = message.data;
		if (!data) return;
		const cmd = data[0];
		const midiNote = data[1];

		if (cmd === 144) {
			midiNotes.push(midiNote);
		}

		if (cmd === 128) {
			midiNotes = midiNotes.filter((n) => n !== midiNote);
		}

		notes = midiNotes.map(Note.fromMidi);

		chords = Chord.detect(notes);
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
						{#each midi.inputs.values() as input (input)}
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

	<div class="flex w-full flex-1 flex-col items-center justify-end">
		<Keyboard activeNotes={notes} />
	</div>
	<div class="flex w-full flex-1 flex-col items-center justify-start">
		{#if chords.length}
			{#each chords as chord (chord)}
				<h1 class="text-9xl font-bold">{chord}</h1>
			{/each}
		{/if}
	</div>
</div>

<!-- <h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->
