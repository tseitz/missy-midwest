<script lang="ts">
	import { Turnstile } from 'svelte-turnstile';
	import { enhance } from '$app/forms';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	const turnstileSiteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string;

	const phoneRegExp =
		/^(((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?)?$/;

	let formData = $state({
		name: '',
		email: '',
		phone: '',
		message: ''
	});

	let errors = $state({
		name: '',
		email: '',
		phone: '',
		message: ''
	});

	let submitAttempted = $state(false);
	let isSubmitting = $state(false);

	type ContactResult = { success: boolean; message?: string };

	let form = $state<ContactResult | null>(null);
	let turnstileKey = $state(0);

	function validateForm() {
		errors = { name: '', email: '', phone: '', message: '' };
		let isValid = true;

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
			isValid = false;
		}

		if (!formData.email.trim()) {
			errors.email = 'Email is required';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Please enter a valid email';
			isValid = false;
		}

		if (formData.phone && !phoneRegExp.test(formData.phone)) {
			errors.phone = 'Phone number is not valid';
			isValid = false;
		}

		if (!formData.message.trim()) {
			errors.message = 'Message is required';
			isValid = false;
		} else if (formData.message.length > 10000) {
			errors.message = `Whoa, that's a long message. Could you trim it down a bit?`;
			isValid = false;
		}

		return isValid;
	}

	function resetTurnstile() {
		// Force a fresh Turnstile token for the next submission by re-rendering the widget.
		turnstileKey++;
	}
</script>

<section id="contact" class="w-full max-w-screen-2xl pt-12 pb-16 lg:pt-20">
	<SectionHeading label="Booking" title="Get in touch" />
	<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
		<div>
			<p class="leading-relaxed opacity-85">
				For festival bookings, residencies, workshop offerings or any other inquires please fill out
				this form.
				<br />
				<br />
				You can also visit the linktree below for all her latest music, ticket information and more.
				<br />
				<br />
				<a href="https://linktr.ee/missymidwest" target="_blank" class="text-missy-blush"
					>https://linktr.ee/missymidwest</a
				>
			</p>
		</div>
		<div class="panel-glass p-8">
			<form
				method="POST"
				action="?/contact"
				use:enhance={() => {
					submitAttempted = true;

					if (!validateForm()) {
						return ({ update }) => update({ reset: false });
					}

					isSubmitting = true;

					return async ({ result, update }) => {
						if (result.type === 'success' || result.type === 'failure') {
							form = result.data as ContactResult;
						} else {
							form = { success: false, message: 'Something went wrong. Please try again.' };
						}

						isSubmitting = false;
						resetTurnstile();

						if (form?.success) {
							formData = { name: '', email: '', phone: '', message: '' };
							submitAttempted = false;
						}

						await update({ reset: false });
					};
				}}
			>
				<label class="mb-2 block text-sm font-medium text-missy-classic-lavender" for="name"
					>Name</label
				>
				<input
					id="name"
					name="name"
					type="text"
					class="w-full rounded-lg border border-missy-classic-lavender/25 bg-black/25 px-4 py-3 text-slate-50 placeholder:text-slate-400 transition focus:border-missy-blush focus:ring-2 focus:ring-missy-classic-lavender/30 focus:outline-none"
					bind:value={formData.name}
					required
				/>
				{#if submitAttempted && errors.name}
					<small class="text-missy-magenta">{errors.name}</small>
				{/if}

				<label class="mt-5 mb-2 block text-sm font-medium text-missy-classic-lavender" for="email"
					>Email</label
				>
				<input
					id="email"
					name="email"
					type="email"
					class="w-full rounded-lg border border-missy-classic-lavender/25 bg-black/25 px-4 py-3 text-slate-50 placeholder:text-slate-400 transition focus:border-missy-blush focus:ring-2 focus:ring-missy-classic-lavender/30 focus:outline-none"
					bind:value={formData.email}
					required
				/>
				{#if submitAttempted && errors.email}
					<small class="text-missy-magenta">{errors.email}</small>
				{/if}

				<label class="mt-5 mb-2 block text-sm font-medium text-missy-classic-lavender" for="phone"
					>Phone (Optional)</label
				>
				<input
					id="phone"
					name="phone"
					type="text"
					class="w-full rounded-lg border border-missy-classic-lavender/25 bg-black/25 px-4 py-3 text-slate-50 placeholder:text-slate-400 transition focus:border-missy-blush focus:ring-2 focus:ring-missy-classic-lavender/30 focus:outline-none"
					bind:value={formData.phone}
				/>
				{#if submitAttempted && errors.phone}
					<small class="text-missy-magenta">{errors.phone}</small>
				{/if}

				<label class="mt-5 mb-2 block text-sm font-medium text-missy-classic-lavender" for="message"
					>Message</label
				>
				<textarea
					id="message"
					name="message"
					rows="7"
					class="w-full rounded-lg border border-missy-classic-lavender/25 bg-black/25 px-4 py-3 text-slate-50 placeholder:text-slate-400 transition focus:border-missy-blush focus:ring-2 focus:ring-missy-classic-lavender/30 focus:outline-none"
					bind:value={formData.message}
					required
				></textarea>
				{#if submitAttempted && errors.message}
					<small class="text-missy-magenta">{errors.message}</small>
				{/if}

				<div class="mt-4">
					{#key turnstileKey}
						<Turnstile siteKey={turnstileSiteKey} theme="auto" />
					{/key}
				</div>

				{#if form}
					<p
						role="status"
						aria-live="polite"
						class="mt-6 rounded-md px-4 py-3 text-sm font-medium {form.success
							? 'bg-missy-deep-purple/80 text-slate-50'
							: 'bg-missy-magenta/90 text-slate-50'}"
					>
						{form.message}
					</p>
				{/if}

				<div class="mt-6 flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting}
						label={isSubmitting ? 'Sending…' : 'Send message'}
					/>
				</div>
			</form>
		</div>
	</div>
</section>

<style>
	small {
		display: block;
		font-size: 14px;
		margin-top: 10px;
	}
</style>
