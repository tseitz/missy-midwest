<script lang="ts">
	import missyGuitarPic from './images/missy-guitar-pic.png';
	import missyMidwest from './images/missy-midwest.png';
	import missyMidwestArtistPicDownload from './images/missy-midwest-artist-pic.jpeg';
	import missyMidwestArtistPic from './images/missy-midwest-artist-pic-render.webp';
	import { fade } from 'svelte/transition';

	import Icon from '@iconify/svelte';

	let show = -1;

	function showIcon(index: number) {
		if (show !== index) {
			show = index;
		}
	}
</script>

<section id="press" class="max-w-screen-2xl w-full pt-12 lg:pt-20 pb-24">
	<h2 class="text-secondary text-4xl italic mb-12">Press Kit</h2>
	<div class="grid sm:grid-cols-3 xs:grid-cols-1 gap-10">
		<div class="w-full bg-base-100 rounded-md">
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
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full m-auto" src={missyGuitarPic} alt="Missy Guitar Pic" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
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
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full my-auto" src={missyMidwest} alt="Missy Logo" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href={missyMidwestArtistPicDownload}
				on:mouseover={() => showIcon(3)}
				on:focus={() => showIcon(3)}
				on:mouseleave={() => showIcon(-1)}
				download=""
			>
				{#if show === 3}
					<div transition:fade={{ duration: 180 }}>
						<Icon
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/>
					</div>
				{/if}
				<img class="w-full rounded-md" src={missyMidwestArtistPic} alt="Missy Press Kit" />
			</a>
		</div>
	</div>
</section>
