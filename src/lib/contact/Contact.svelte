<script lang="ts">
	import { Turnstile } from 'svelte-turnstile';
	import { enhance } from '$app/forms';
	import { sendEmail } from '$lib/email';
	import { browser } from '$app/environment';

	const turnstileSiteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string;
	const emailServiceId = import.meta.env['VITE_EMAILJS_SERVICE_ID'] as string;
	const emailTemplateId = import.meta.env['VITE_EMAILJS_TEMPLATE_ID'] as string;
	const emailPublicKey = import.meta.env['VITE_EMAILJS_PUBLIC_KEY'] as string;

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
		errors = {
			name: '',
			email: '',
			phone: '',
			message: ''
		};

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
		// Reset Turnstile by incrementing key to force re-render
		// This ensures a fresh token is generated for the next submission
		turnstileKey++;
	}

	$effect(() => {
		if (form) {
			if (form.success) {
				alert(form.message || 'Message sent! Thanks for your submission :)');
				formData = {
					name: '',
					email: '',
					phone: '',
					message: ''
				};
				submitAttempted = false;
				resetTurnstile();
			} else {
				alert(form.message || 'Something went wrong. Please try again.');
				resetTurnstile();
			}

			form = null;
		}
	});
</script>

<section
	id="contact"
	class="grid w-full max-w-screen-2xl grid-cols-1 gap-8 pt-12 pb-16 md:grid-cols-2 md:gap-16 lg:pt-20"
>
	<div>
		<h2 class="mb-8 text-4xl md:mb-12">Contact</h2>
		<p>
			For festival bookings, residencies, workshop offerings or any other inquires please fill out
			this form.
			<br />
			<br />
			You can also visit the linktree below for all her latest music, ticket information and more.
			<br />
			<br />
			<a href="https://linktr.ee/missymidwest" target="_blank">https://linktr.ee/missymidwest</a>
			<!-- Missy also streams every morning at 8 a.m. Find her on Twitch
			<a href="https://www.twitch.tv/missymidwest" target="_blank" rel="noreferrer">here</a>. -->
		</p>
	</div>
	<div class="bg-missy-classic-lavender rounded-md p-8">
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
					// If Turnstile validation passed, send email from client
					if (result.type === 'success' && browser) {
						try {
							const emailSent = await sendEmail(
								formData,
								emailServiceId,
								emailTemplateId,
								emailPublicKey
							);

							if (emailSent) {
								form = result.data as ContactResult;
							} else {
								form = {
									success: false,
									message:
										'Something went wrong. You can email Missy directly at missy.midwestofficial@gmail.com'
								};
							}
						} catch (error) {
							console.error('Email send error:', error);
							form = {
								success: false,
								message: 'Something went wrong. Please try again.'
							};
						}
					} else if (result.type === 'success') {
						form = result.data as ContactResult;
					} else if (result.type === 'failure') {
						// Turnstile validation failed or other server error - reset CAPTCHA
						form = result.data as ContactResult;
						resetTurnstile();
					}

					isSubmitting = false;
					await update({ reset: false });
				};
			}}
		>
			<label class="mb-2 text-xl" for="name">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.name}
				required
			/>
			{#if submitAttempted && errors.name}
				<small class="text-missy-magenta">{errors.name}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.email}
				required
			/>
			{#if submitAttempted && errors.email}
				<small class="text-missy-magenta">{errors.email}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="phone">Phone (Optional)</label>
			<input
				id="phone"
				name="phone"
				type="text"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.phone}
			/>
			{#if submitAttempted && errors.phone}
				<small class="text-missy-magenta">{errors.phone}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="message">Message</label>
			<textarea
				id="message"
				name="message"
				rows="7"
				class="text-missy-deep-purple bg-slate-50"
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

			<div class="mt-4 flex justify-end">
				<button
					class="bg-missy-deep-purple/80 shadow-missy-classic-lavender/20 hover:bg-missy-deep-purple/90 hover:shadow-missy-classic-lavender/30 focus:ring-missy-classic-lavender/50 rounded-lg px-6 py-3 font-semibold text-slate-50 shadow-lg backdrop-blur-lg transition-all duration-300 ease-out hover:cursor-pointer hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Sending...' : 'Submit'}
				</button>
			</div>
		</form>
	</div>
</section>

<style>
	input,
	textarea {
		padding: 12px;
		width: 100%;
	}

	label {
		display: block;
	}

	small {
		display: block;
		font-size: 14px;
		margin-top: 10px;
	}
</style>
