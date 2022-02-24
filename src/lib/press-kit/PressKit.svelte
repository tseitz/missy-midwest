<script lang="ts">
	import missyGuitarPic from './images/missy-guitar-pic.png';
	import missyMidwest from './images/missy-midwest.png';
	import purpleGlowPartyPdf from './images/purple-glow-party-event.pdf';
	import purpleGlowPartyImg from './images/glow-party.webp';
	import { fade } from 'svelte/transition';

	import Icon from '@iconify/svelte';

	let show = -1;

	function showIcon(index: number) {
		if (show !== index) {
			show = index;
		}
	}
</script>

<section id="press" class="max-w-screen-2xl w-full py-12 md:py-20">
	<h2 class="text-slate-100 text-4xl italic mb-12">Press Kit</h2>
	<div class="grid sm:grid-cols-3 xs:grid-cols-1 gap-10">
		<div class="w-full bg-slate-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href={missyGuitarPic}
				on:mouseover={() => showIcon(1)}
				on:focus={() => showIcon(1)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 1}
					<div transition:fade={{ duration: 180 }}>
						<Icon
							class="text-missy-500 bg-slate-200 rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full m-auto" src={missyGuitarPic} alt="Missy Guitar Pic" />
			</a>
		</div>
		<div class="w-full bg-slate-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href={missyMidwest}
				on:mouseover={() => showIcon(2)}
				on:focus={() => showIcon(2)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 2}
					<div transition:fade={{ duration: 180 }}>
						<Icon
							class="text-missy-500 bg-slate-200 rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full my-auto" src={missyMidwest} alt="Missy Logo" />
			</a>
		</div>
		<div class="w-full bg-slate-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href={purpleGlowPartyPdf}
				on:mouseover={() => showIcon(3)}
				on:focus={() => showIcon(3)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 3}
					<div transition:fade={{ duration: 180 }}>
						<Icon
							class="text-missy-500 bg-slate-200 rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full rounded-md" src={purpleGlowPartyImg} alt="Missy Press Kit" />
			</a>
		</div>
	</div>
</section>
