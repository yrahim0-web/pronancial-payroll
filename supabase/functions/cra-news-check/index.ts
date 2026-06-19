import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const FEEDS = [
  { url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/bsnsss-eng.xml', source: 'CRA Businesses', defaultCategory: 'corporate' },
  { url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/t1gtrdy-eng.xml', source: 'CRA Individuals', defaultCategory: 'personal' },
  { url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/mdrm-eng.xml', source: 'CRA Newsroom', defaultCategory: null },
];

const KEYWORDS = {
  payroll: ['payroll', 'cpp', 'canada pension plan', 'employment insurance', ' ei ', 'td1', 't4', 'source deduction', 'remittance', 'pensionable', 'insurable earnings'],
  corporate: ['corporate tax', 'corporation', 'business tax', 'capital cost allowance', 'small business deduction', 'gst/hst', 'gst', 'hst', 'excise'],
  personal: ['personal tax', 'individual tax', 'rrsp', 'tfsa', 'basic personal amount', 'tax bracket', 't1 ', 'income tax return', 'benefit payment'],
};

function categorize(text: string) {
  const lower = text.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lower.includes(w))) return cat;
  }
  return null;
}

function stripTags(html = '') {
  return html.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

// RSS 2.0 style (<item> tags) — kept as a fallback in case any feed switches format
function parseRSSItems(xml: string) {
  const items: any[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  for (const block of itemBlocks) {
    const title = stripTags((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = stripTags((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
    const pubDate = stripTags((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
    const description = stripTags((block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '');
    if (title && link) items.push({ title, link, pubDate, description });
  }
  return items;
}

// Atom style (<entry> tags) — this is what CRA's feeds actually use
function parseAtomEntries(xml: string) {
  const items: any[] = [];
  const entryBlocks = xml.match(/<entry[\s\S]*?<\/entry>/g) || [];
  for (const block of entryBlocks) {
    const title = stripTags((block.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '');

    let link = '';
    const linkTags = [...block.matchAll(/<link\b[^>]*\/?>/g)].map(m => m[0]);
    for (const tag of linkTags) {
      const hrefMatch = tag.match(/href="([^"]+)"/);
      const relMatch = tag.match(/rel="([^"]+)"/);
      if (hrefMatch && (!relMatch || relMatch[1] === 'alternate')) { link = hrefMatch[1]; break; }
    }
    if (!link && linkTags.length > 0) {
      const hrefMatch = linkTags[0].match(/href="([^"]+)"/);
      if (hrefMatch) link = hrefMatch[1];
    }

    const pubDate = stripTags(
      (block.match(/<updated>([\s\S]*?)<\/updated>/) || block.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || ''
    );
    const description = stripTags(
      (block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || block.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || ''
    );

    if (title && link) items.push({ title, link, pubDate, description });
  }
  return items;
}

function parseFeedItems(xml: string) {
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  return isAtom ? parseAtomEntries(xml) : parseRSSItems(xml);
}

Deno.serve(async (_req) => {
  let processed = 0;
  const errors: string[] = [];
  const debug: any[] = [];

  for (const feed of FEEDS) {
    try {
      const r = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PronancialBot/1.0)' }
      });
      const xml = await r.text();
      const items = parseFeedItems(xml);
      const categorizedCount = items.filter(i => categorize(`${i.title} ${i.description}`)).length;

      debug.push({
        source: feed.source,
        httpStatus: r.status,
        rawItemCount: items.length,
        categorizedCount,
        sampleTitles: items.slice(0, 3).map(i => i.title),
      });

      for (const item of items) {
        const category = categorize(`${item.title} ${item.description}`) || feed.defaultCategory;
        if (!category) continue;

        const { error } = await supabaseAdmin
          .from('cra_news')
          .upsert({
            title: item.title,
            link: item.link,
            summary: item.description?.slice(0, 400) || null,
            source: feed.source,
            category,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          }, { onConflict: 'link', ignoreDuplicates: true });

        if (!error) processed++;
        else errors.push(`upsert failed for "${item.title}": ${error.message}`);
      }
    } catch (err) {
      errors.push(`${feed.source} fetch failed: ${err.message}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, processed, errors, debug }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});