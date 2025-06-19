<script lang="ts">
	import { fade } from 'svelte/transition';

	let show = -1;

	function showIcon(index: number) {
		if (show !== index) {
			show = index;
		}
	}
</script>

<section id="press" class="max-w-screen-2xl w-full pt-12 lg:pt-20 pb-24">
	<h2 class="text-secondary text-4xl mb-12">Press Kit</h2>
	<div class="grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-8">
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href="/press-kit/missy-presskit-bio.txt"
				on:mouseover={() => showIcon(1)}
				on:focus={() => showIcon(1)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 1}
					<div transition:fade={{ duration: 180 }}>
						<!-- <Icon
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/> -->
					</div>
				{/if}
				<img class="w-full m-auto" src="/press-kit/missy-presskit-bio.webp" alt="Missy Bio" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href="/press-kit/missy-logo.png"
				on:mouseover={() => showIcon(2)}
				on:focus={() => showIcon(2)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 2}
					<div transition:fade={{ duration: 180 }}>
						<!-- <Icon
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/> -->
					</div>
				{/if}
				<img class="w-full my-auto" src="/press-kit/missy-logo.png" alt="Missy Logo" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href="/press-kit/missy-fan.jpg"
				on:mouseover={() => showIcon(3)}
				on:focus={() => showIcon(3)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 3}
					<div transition:fade={{ duration: 180 }}>
						<!-- <Icon
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/> -->
					</div>
				{/if}
				<img class="w-full rounded-md" src="/press-kit/missy-fan.webp" alt="Missy Artist Pic" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center"
				href="/press-kit/missy-profile.jpg"
				on:mouseover={() => showIcon(4)}
				on:focus={() => showIcon(4)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 4}
					<div transition:fade={{ duration: 180 }}>
						<!-- <Icon
							class="text-secondary bg-base-content rounded-md absolute h-full w-full opacity-70 p-24"
							icon="bi:cloud-download"
						/> -->
					</div>
				{/if}
				<img
					class="w-full rounded-md"
					src="/press-kit/missy-profile.webp"
					alt="Missy Artist Pic 2"
				/>
			</a>
		</div>
	</div>
</section>
