<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from './Button.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import { NAV_LINKS } from '$lib/nav';

	const year = 2026;
</script>

<footer class="border-missy-classic-lavender/15 w-full border-t bg-[#100c1a]">
	<div class="mx-auto grid w-full max-w-screen-2xl gap-10 px-8 py-12 md:grid-cols-3 md:px-14">
		<div>
			<div class="missy-header text-2xl text-white">Missy Midwest</div>
			<p class="mt-3 max-w-xs text-sm opacity-80">
				Booking, residencies &amp; workshops — let's make something loud.
			</p>
			<div class="mt-4">
				<Button href={resolve('/contact')} label="Book Missy →" variant="fill" />
			</div>
		</div>

		<div>
			<h4 class="label-eyebrow mb-3">Explore</h4>
			<ul class="space-y-2 text-sm">
				{#each NAV_LINKS as link (link.href)}
					<li><a href={resolve(link.href)}>{link.label}</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h4 class="label-eyebrow mb-3">Support &amp; Follow</h4>
			<ul class="space-y-2 text-sm">
				<li>
					<a href="https://venmo.com/u/missymidwest" target="_blank" rel="noreferrer"
						>Venmo @missymidwest</a
					>
				</li>
				<li>
					<a href="https://cash.app/$missymidwest" target="_blank" rel="noreferrer"
						>Cash App $missymidwest</a
					>
				</li>
			</ul>
			<div class="mt-4"><SocialLinks size={22} /></div>
		</div>
	</div>
	<div class="bg-[#0c0913] py-4 text-center text-xs opacity-50">
		© {year} Missy Midwest · Jordan Brooke Music LLC
	</div>
</footer>
