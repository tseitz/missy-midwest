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

	let form = $state<{ success: boolean; message?: string } | null>(null);

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
			} else {
				alert(form.message || 'Something went wrong. Please try again.');
			}

			form = null;
		}
	});
</script>

<section
	id="contact"
	class="max-w-screen-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-12 lg:pt-20 pb-16"
>
	<div>
		<h2 class="text-4xl mb-8 md:mb-12">Contact</h2>
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
	<div class="rounded-md p-8 bg-missy-classic-lavender">
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
								form = result.data as any;
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
						form = result.data as any;
					} else if (result.type === 'failure') {
						form = result.data as any;
					}

					isSubmitting = false;
					await update({ reset: false });
				};
			}}
		>
			<label class="text-xl mb-2" for="name">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.name}
				required
			/>
			{#if submitAttempted && errors.name}
				<small class="text-missy-magenta">{errors.name}</small>
			{/if}

			<label class="text-xl mt-4 mb-2" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.email}
				required
			/>
			{#if submitAttempted && errors.email}
				<small class="text-missy-magenta">{errors.email}</small>
			{/if}

			<label class="text-xl mt-4 mb-2" for="phone">Phone (Optional)</label>
			<input
				id="phone"
				name="phone"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.phone}
			/>
			{#if submitAttempted && errors.phone}
				<small class="text-missy-magenta">{errors.phone}</small>
			{/if}

			<label class="text-xl mt-4 mb-2" for="message">Message</label>
			<textarea
				id="message"
				name="message"
				rows="7"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.message}
				required
			></textarea>
			{#if submitAttempted && errors.message}
				<small class="text-missy-magenta">{errors.message}</small>
			{/if}

			<div class="mt-4">
				<Turnstile siteKey={turnstileSiteKey} theme="auto" />
			</div>

			<div class="flex justify-end mt-4">
				<button
					class="px-6 py-3 bg-missy-deep-purple/80 backdrop-blur-lg text-slate-50 font-semibold rounded-lg shadow-lg shadow-missy-classic-lavender/20 hover:bg-missy-deep-purple/90 hover:shadow-xl hover:shadow-missy-classic-lavender/30 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-missy-classic-lavender/50 focus:ring-offset-2 focus:ring-offset-transparent hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
