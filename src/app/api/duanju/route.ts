/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import { NextRequest } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { getAvailableApiSites } from '@/lib/config';

export const runtime = 'edge';

const UA = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

interface DuanjuItem {
  title: string;
  pic: string;
  remarks: string;
  cls: string;
  sources: string[];
  time: string;
}

let cache: { ts: number; items: DuanjuItem[] } | null = null;

async function fetchJSON(url: string): Promise<any> {
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function sourceItems(site: { name: string; api: string }): Promise<DuanjuItem[]> {
  const list = await fetchJSON(site.api + '?ac=list');
  if (!list || !Array.isArray(list.class)) return [];
  const classes = list.class.filter((c: any) => /短剧|漫剧/.test(c.type_name || ''));
  classes.sort((a: any, b: any) => {
    const score = (n: string) => (/AI/i.test(n) ? 0 : /漫剧/.test(n) ? 1 : 2);
    return score(a.type_name) - score(b.type_name);
  });
  const out: DuanjuItem[] = [];
  for (const c of classes.slice(0, 2)) {
    const d = await fetchJSON(site.api + '?ac=detail&t=' + c.type_id + '&pg=1');
    if (!d || !Array.isArray(d.list)) continue;
    for (const it of d.list.slice(0, 20)) {
      if (!it.vod_name) continue;
      out.push({
        title: it.vod_name,
        pic: it.vod_pic || '',
        remarks: it.vod_remarks || '',
        cls: c.type_name,
        sources: [site.name],
        time: it.vod_time || '',
      });
    }
  }
  return out;
}

export async function GET(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  let username: string | undefined;
  if (storageType !== 'localstorage') {
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    username = authInfo.username;
  }

  if (cache && Date.now() - cache.ts < 30 * 60 * 1000) {
    return new Response(JSON.stringify({ items: cache.items, cached: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sites = await getAvailableApiSites(username);
  const settled = await Promise.allSettled(sites.map((s) => sourceItems(s)));
  const byTitle = new Map<string, DuanjuItem>();
  for (const s of settled) {
    if (s.status !== 'fulfilled') continue;
    for (const it of s.value) {
      const key = it.title.replace(/\s+/g, '');
      const ex = byTitle.get(key);
      if (ex) {
        if (!ex.sources.includes(it.sources[0])) ex.sources.push(it.sources[0]);
        if (!ex.pic && it.pic) ex.pic = it.pic;
        if (it.time > ex.time) ex.time = it.time;
      } else {
        byTitle.set(key, { ...it });
      }
    }
  }
  const items = Array.from(byTitle.values())
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    .slice(0, 400);
  if (items.length) cache = { ts: Date.now(), items };
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
