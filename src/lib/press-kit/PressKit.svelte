<script lang="ts">
	import { asset } from '$app/paths';
	import { fade } from 'svelte/transition';

	let show = -1;

	function showIcon(index: number) {
		if (show !== index) {
			show = index;
		}
	}
</script>

<section id="press" class="w-full max-w-screen-2xl pt-12 pb-24 lg:pt-20">
	<h2 class="mb-12 text-4xl">Press Kit</h2>
	<div class="xs:grid-cols-1 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
		<div class="bg-base-100 w-full rounded-md">
			<a
				class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
				href={asset('/press-kit/missy-midwest-press-kit.pdf')}
				on:mouseover={() => showIcon(1)}
				on:focus={() => showIcon(1)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 1}
					<div
						transition:fade={{ duration: 180 }}
						class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
					>
						<svg
							class="text-missy-classic-lavender h-16 w-16"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img
					class="m-auto w-full"
					src="/press-kit/missy-midwest-press-kit.png"
					alt="Missy Press Kit"
				/>
			</a>
		</div>
		<div class="bg-base-100 w-full rounded-md">
			<a
				class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
				href={asset('/press-kit/missy-presskit-bio.txt')}
				on:mouseover={() => showIcon(2)}
				on:focus={() => showIcon(2)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 2}
					<div
						transition:fade={{ duration: 180 }}
						class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
					>
						<svg
							class="text-missy-classic-lavender h-16 w-16"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img class="m-auto w-full" src="/press-kit/missy-presskit-bio.webp" alt="Missy Bio" />
			</a>
		</div>
		<div class="bg-base-100 w-full rounded-md">
			<a
				class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
				href={asset('/header/missy-midwest-logo.png')}
				on:mouseover={() => showIcon(3)}
				on:focus={() => showIcon(3)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 3}
					<div
						transition:fade={{ duration: 180 }}
						class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
					>
						<svg
							class="text-missy-classic-lavender h-16 w-16"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
						</svg>
					</div>
				{/if}
				<img class="my-auto w-full" src="/header/missy-midwest-logo.png" alt="Missy Logo" />
			</a>
		</div>
		<div class="bg-base-100 w-full rounded-md">
			<a
				class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
				href={asset('/press-kit/missy-fan.jpg')}
				on:mouseover={() => showIcon(4)}
				on:focus={() => showIcon(4)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 4}
					<div
						transition:fade={{ duration: 180 }}
						class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
					>
						<svg
							class="text-missy-classic-lavender h-16 w-16"
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
		<div class="bg-base-100 w-full rounded-md">
			<a
				class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
				href={asset('/press-kit/missy-profile.jpg')}
				on:mouseover={() => showIcon(5)}
				on:focus={() => showIcon(5)}
				on:mouseleave={() => showIcon(-1)}
				download
			>
				{#if show === 5}
					<div
						transition:fade={{ duration: 180 }}
						class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
					>
						<svg
							class="text-missy-classic-lavender h-16 w-16"
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
