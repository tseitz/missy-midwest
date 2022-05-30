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
	class="max-w-screen-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-20 pb-16"
>
	<div>
		<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Contact</h2>
		<p class="text-slate-100">
			Missy would love to hear from you! For bookings and inquiries please fill out the form.
			<br />
			<br />
			Missy also streams every morning at 8 a.m. Find her
			<a href="https://www.twitch.tv/missymidwest" target="_blank">here</a>
		</p>
	</div>
	<div class="bg-slate-100 rounded-md p-8">
		<form on:submit={handleSubmit}>
			<label class="text-xl missy-header text-missy-500 mb-2" for="name">Name</label>
			<input
				id="name"
				name="name"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.name}
			/>
			{#if submit && $errors.name}
				<small class="text-red-500">{$errors.name}</small>
			{/if}

			<label class="text-xl missy-header text-missy-500 mt-4 mb-2" for="email">Email</label>
			<input
				id="email"
				name="email"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.email}
			/>
			{#if submit && $errors.email}
				<small class="text-red-500">{$errors.email}</small>
			{/if}

			<label class="text-xl missy-header text-missy-500 mt-4 mb-2" for="phone"
				>Phone (Optional)</label
			>
			<input
				id="phone"
				name="phone"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.phone}
			/>
			{#if submit && $errors.phone}
				<small class="text-red-500">{$errors.phone}</small>
			{/if}

			<label class="text-xl missy-header text-missy-500 mt-4 mb-2" for="message">Message</label>
			<textarea
				id="message"
				name="message"
				rows="7"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.message}
			/>
			{#if submit && $errors.message}
				<small class="text-red-500">{$errors.message}</small>
			{/if}

			<div class="btn-wrap flex justify-end mt-4">
				<button
					class="g-recaptcha bg-pink-500 hover:bg-pink-700 text-slate-100 font-bold py-2 px-4 rounded"
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
