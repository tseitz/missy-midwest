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
	<h2 class="text-4xl mb-12">Press Kit</h2>
	<div class="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-8">
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				href="/press-kit/missy-midwest-press-kit.pdf"
				on:mouseover={() => showIcon(1)}
				on:focus={() => showIcon(1)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 1}
					<div
						transition:fade={{ duration: 180 }}
						class="absolute inset-0 flex items-center justify-center bg-missy-deep-purple/50 rounded-md z-10"
					>
						<svg
							class="w-16 h-16 text-missy-classic-lavender"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img
					class="w-full m-auto"
					src="/press-kit/missy-midwest-press-kit.png"
					alt="Missy Press Kit"
				/>
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				href="/press-kit/missy-presskit-bio.txt"
				on:mouseover={() => showIcon(2)}
				on:focus={() => showIcon(2)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 2}
					<div
						transition:fade={{ duration: 180 }}
						class="absolute inset-0 flex items-center justify-center bg-missy-deep-purple/50 rounded-md z-10"
					>
						<svg
							class="w-16 h-16 text-missy-classic-lavender"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img class="w-full m-auto" src="/press-kit/missy-presskit-bio.webp" alt="Missy Bio" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				href="/header/missy-midwest-logo.png"
				on:mouseover={() => showIcon(3)}
				on:focus={() => showIcon(3)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 3}
					<div
						transition:fade={{ duration: 180 }}
						class="absolute inset-0 flex items-center justify-center bg-missy-deep-purple/50 rounded-md z-10"
					>
						<svg
							class="w-16 h-16 text-missy-classic-lavender"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img class="w-full my-auto" src="/header/missy-midwest-logo.png" alt="Missy Logo" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				href="/press-kit/missy-fan.jpg"
				on:mouseover={() => showIcon(4)}
				on:focus={() => showIcon(4)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 4}
					<div
						transition:fade={{ duration: 180 }}
						class="absolute inset-0 flex items-center justify-center bg-missy-deep-purple/50 rounded-md z-10"
					>
						<svg
							class="w-16 h-16 text-missy-classic-lavender"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img class="w-full rounded-md" src="/press-kit/missy-fan.webp" alt="Missy Artist Pic" />
			</a>
		</div>
		<div class="w-full bg-base-100 rounded-md">
			<a
				class="relative h-full flex flex-col justify-center hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				href="/press-kit/missy-profile.jpg"
				on:mouseover={() => showIcon(5)}
				on:focus={() => showIcon(5)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 5}
					<div
						transition:fade={{ duration: 180 }}
						class="absolute inset-0 flex items-center justify-center bg-missy-deep-purple/50 rounded-md z-10"
					>
						<svg
							class="w-16 h-16 text-missy-classic-lavender"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
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

<style>
	#press a:hover {
		transform: scale(1.02) rotate(-0.1deg);
		transition: all 0.33s ease-out;
	}
</style>
