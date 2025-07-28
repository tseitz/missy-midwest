<script lang="ts">
	import { init, send } from '@emailjs/browser';

	const emailUserId = import.meta.env['VITE_MISSY_EMAIL_USER_ID'] as string;
	const emailServiceId = import.meta.env['VITE_MISSY_EMAIL_SERVICE_ID'] as string;
	const emailTemplateId = import.meta.env['VITE_MISSY_EMAIL_TEMPLATE_ID'] as string;

	init(emailUserId);

	const phoneRegExp =
		/^(((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?)?$/;

	let formData = {
		name: '',
		email: '',
		phone: '',
		message: ''
	};

	let errors = {
		name: '',
		email: '',
		phone: '',
		message: ''
	};

	let submitAttempted = false;

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

	function resetForm() {
		formData = {
			name: '',
			email: '',
			phone: '',
			message: ''
		};
		errors = {
			name: '',
			email: '',
			phone: '',
			message: ''
		};
		submitAttempted = false;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitAttempted = true;

		if (!validateForm()) {
			return;
		}

		grecaptcha.ready(function () {
			grecaptcha
				.execute('6LdOxaEeAAAAAEVoXpwQ_G_30DI8m8y5xcUhARAf', { action: 'submit' })
				.then(async (token: string) => {
					if (token) {
						const validation = await fetch(`/captcha`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								token
							})
						});

						const validationResp = await validation.json();
						if (validation.status === 200) {
							const emailResp = await send(emailServiceId, emailTemplateId, formData);
							console.log(emailResp);
							if (emailResp.status === 200) {
								resetForm();
								alert(validationResp.message);
							} else {
								alert(
									'Something went wrong. You can email Missy directly at missy.midwestofficial@gmail.com'
								);
							}
						} else {
							alert(validationResp.error);
						}
					}
				});
		});
	}
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
		<form on:submit={handleSubmit}>
			<label class="text-xl mb-2" for="name">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.name}
			/>
			{#if submitAttempted && errors.name}
				<small class="text-missy-magenta">{errors.name}</small>
			{/if}

			<label class="text-xl mt-4 mb-2" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				bind:value={formData.email}
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
			></textarea>
			{#if submitAttempted && errors.message}
				<small class="text-missy-magenta">{errors.message}</small>
			{/if}

			<div class="flex justify-end mt-4">
				<button
					class="g-recaptcha px-6 py-3 bg-missy-deep-purple/80 backdrop-blur-lg text-slate-50 font-semibold rounded-lg shadow-lg shadow-missy-classic-lavender/20 hover:bg-missy-deep-purple/90 hover:shadow-xl hover:shadow-missy-classic-lavender/30 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-missy-classic-lavender/50 focus:ring-offset-2 focus:ring-offset-transparent hover:cursor-pointer"
					type="submit"
					data-sitekey={import.meta.env['VITE_RECAPTCHA_SITE_KEY']}
					data-callback="onSubmit"
					data-action={handleSubmit}>Submit</button
				>
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
