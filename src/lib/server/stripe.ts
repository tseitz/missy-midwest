import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Read the key at runtime (dynamic, not inlined at build) so rotating it takes
// effect on the next deploy without the build depending on the value — and so a
// missing key degrades gracefully instead of failing the build. The placeholder
// lets the client construct when unset; real calls then fail and surface via the
// caller's reportFailure (e.g. catalog.ts), matching the other integrations.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? 'sk_placeholder_unset');
