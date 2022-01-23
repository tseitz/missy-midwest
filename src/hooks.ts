import cookie from 'cookie';

import { v4 as uuid } from '@lukeed/uuid';
import type {
	ExternalFetch,
	Handle
} from '@sveltejs/kit';

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	request.locals.userid = cookies.userid || uuid();

	const response = await resolve(request);

	if (!cookies.userid) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers['set-cookie'] = cookie.serialize('userid', request.locals.userid, {
			path: '/',
			httpOnly: true
		});
	}

	return response;
};

export const externalFetch: ExternalFetch = async (request) => {
	console.log('intercepted');
	if (request.url.startsWith('https://discoveryprovider.audius.co/v1/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://discoveryprovider.audius.co/v1/', 'http://localhost:9999/'),
			request
		);
	}

	return fetch(request);
};
