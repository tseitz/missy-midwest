<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';

	const { form, errors, state, handleChange, handleSubmit } = createForm({
		initialValues: {
			name: '',
			email: ''
		},
		validationSchema: yup.object().shape({
			title: yup.string().oneOf(['Mr.', 'Mrs.', 'Mx.']).required(),
			name: yup.string().required(),
			email: yup.string().email().required()
		}),
		onSubmit: (values) => {
			alert(JSON.stringify(values));
		}
	});
</script>

<section
	id="contact"
	class="max-w-screen-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-12 md:py-20"
>
	<div>
		<h2 class="text-slate-100 text-4xl mb-12 italic">Contact</h2>
		<p class="text-slate-100">
			A midwestern melting pot of EDM, country, bass, and urban styles; Missy Midwest brings dance
			vibes from all your favorite genres
		</p>
	</div>
	<div>
		<form on:submit={handleSubmit}>
			<label for="title">title</label>
			<select id="title" name="title" on:change={handleChange} bind:value={$form.title}>
				<option />
				<option>Mr.</option>
				<option>Mrs.</option>
				<option>Mx.</option>
			</select>
			{#if $errors.title}
				<small>{$errors.title}</small>
			{/if}

			<label for="name">name</label>
			<input
				id="name"
				name="name"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.name}
			/>
			{#if $errors.name}
				<small>{$errors.name}</small>
			{/if}

			<label for="email">email</label>
			<input
				id="email"
				name="email"
				on:change={handleChange}
				on:blur={handleChange}
				bind:value={$form.email}
			/>
			{#if $errors.email}
				<small>{$errors.email}</small>
			{/if}

			<button type="submit">submit</button>
		</form>
	</div>
</section>

<style>
</style>
