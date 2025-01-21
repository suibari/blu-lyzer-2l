import { NEGAPOSI_API } from '$env/static/private';

export async function fetchSentimentAnalysis(
  texts: string[]
): Promise<{ nouns_counts: any[]; average_sentiments: number[] }> {
  const response = await fetch(NEGAPOSI_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sentiment from NEGPOSI_API');
  }
  
  return response.json();
}
