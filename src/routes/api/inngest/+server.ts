import { INNGEST_SIGNING_KEY } from '$env/static/private';
import { functions, inngest } from '$lib/server/inngest';
import { serve } from 'inngest/sveltekit';

const options = {
  client: inngest,
  functions,
  signingKey: "",
}

if (INNGEST_SIGNING_KEY) {
  options.signingKey = INNGEST_SIGNING_KEY;
}

const inngestServe = serve(options);

export const POST = inngestServe.POST;
export const GET = inngestServe.GET;
export const PUT = inngestServe.PUT;
