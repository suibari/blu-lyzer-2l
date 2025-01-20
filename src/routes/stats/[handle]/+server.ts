import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;

  if (handle) {
    const {data} = await supabase.from("records").select('result_analyze').eq('handle', handle);

    if (data) {
      return new Response(JSON.stringify(data[0]), { status: 200 });
    } else {
      // DBにない、取得して返す
    }
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
};
