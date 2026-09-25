<script>
	let { activeNotes, noteNames = true } = $props();
	let activeNotesMapped = $derived(activeNotes.map((note) => note.replace(/\d+$/, '')));

	const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
	const blackKeys = ['Db', 'Eb', '', 'Gb', 'Ab', 'Bb', ''];
</script>

<div class="relative flex max-w-[440px] gap-2">
	{#each whiteKeys as whiteKey, i (i)}
		<div
			class="flex h-[264px] w-[56px] items-end justify-center border-8 border-t-0 border-neutral-50 text-center text-slate-700 {activeNotesMapped.includes(
				whiteKey
			)
				? 'border-fuchsia-300! bg-fuchsia-500'
				: 'bg-neutral-200'}"
		>
			{#if noteNames}
				<span>
					{whiteKey}
				</span>
			{/if}
		</div>
	{/each}
	<div class="absolute left-[32px] flex w-full justify-between">
		{#each blackKeys as blackKey, i (i)}
			<div class="flex h-[162px] w-[56px] justify-center">
				<div
					class="box-border flex h-full w-5/6 items-end justify-center {blackKey
						? 'border-8 border-t-0 border-slate-900 bg-slate-700'
						: ''}
						{activeNotesMapped.includes(blackKey) ? 'border-fuchsia-300! bg-fuchsia-500!' : ''}
						"
				>
					{#if noteNames}
						<span>
							{blackKey}
						</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
