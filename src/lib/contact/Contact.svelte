<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import { init, send } from '@emailjs/browser';

	const emailUserId = import.meta.env['VITE_MISSY_EMAIL_USER_ID'] as string;
	const emailServiceId = import.meta.env['VITE_MISSY_EMAIL_SERVICE_ID'] as string;
	const emailTemplateId = import.meta.env['VITE_MISSY_EMAIL_TEMPLATE_ID'] as string;

	init(emailUserId);
	const phoneRegExp =
		/^(((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?)?$/;
	let submit = false;
	const { form, errors, handleChange, handleSubmit, handleReset } = createForm({
		initialValues: {
			name: '',
			email: '',
			phone: '',
			message: ''
		},

		validationSchema: yup.object().shape({
			name: yup.string().required('Name is required'),
			email: yup.string().email().required('Email is required'),
			phone: yup.string().matches(phoneRegExp, 'Phone number is not valid'),
			message: yup
				.string()
				.required('Message is required')
				.max(10000, `Whoa, that's a long message. Could you trim it down a bit?`)
		}),

		onSubmit: async (values) => {
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
								const emailResp = await send(emailServiceId, emailTemplateId, values);
								console.log(emailResp);
								if (emailResp.status === 200) {
									handleReset();
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
	<div class="rounded-md p-8 bg-missy-classic-lavender/60 backdrop-blur-md">
		<form on:submit={handleSubmit}>
			<label class="text-xl text-slate-50 mb-2" for="name">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.name}
			/>
			{#if submit && $errors.name}
				<small class="text-missy-magenta">{$errors.name}</small>
			{/if}

			<label class="text-xl text-slate-50 mt-4 mb-2" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.email}
			/>
			{#if submit && $errors.email}
				<small class="text-missy-magenta">{$errors.email}</small>
			{/if}

			<label class="text-xl text-slate-50 mt-4 mb-2" for="phone">Phone (Optional)</label>
			<input
				id="phone"
				name="phone"
				type="text"
				class="bg-slate-50 text-missy-deep-purple"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.phone}
			/>
			{#if submit && $errors.phone}
				<small class="text-missy-magenta">{$errors.phone}</small>
			{/if}

			<label class="text-xl text-slate-50 mt-4 mb-2" for="message">Message</label>
			<textarea
				id="message"
				name="message"
				rows="7"
				class="bg-slate-50 text-missy-deep-purple"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.message}
			></textarea>
			{#if submit && $errors.message}
				<small class="text-missy-magenta">{$errors.message}</small>
			{/if}

			<div class="btn-wrap flex justify-end mt-4">
				<button
					class="g-recaptcha"
					type="submit"
					data-sitekey={import.meta.env['VITE_RECAPTCHA_SITE_KEY']}
					data-callback="onSubmit"
					data-action={handleSubmit}
					on:click={() => (submit = true)}>Submit</button
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
