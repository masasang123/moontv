'use client';

import { useEffect, useMemo, useState } from 'react';

import PageLayout from '@/components/PageLayout';

interface DuanjuItem {
  title: string;
  pic: string;
  remarks: string;
  cls: string;
  sources: string[];
  time: string;
}

export default function DuanjuPage() {
  const [items, setItems] = useState<DuanjuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/duanju')
      .then((r) => {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError('暂时没拉到短剧内容，稍后刷新页面再试');
        setLoading(false);
      });
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.sources))),
    [items]
  );

  const shown = items.filter((i) => {
    if (filter === 'ai' && !(/AI/i.test(i.cls) || /AI/i.test(i.title))) return false;
    if (filter.startsWith('src:') && !i.sources.includes(filter.slice(4))) return false;
    if (query && !i.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  const chipCls = (active: boolean) =>
    'flex-none rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
    (active
      ? 'border-green-500 bg-green-500 text-white'
      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300');

  return (
    <PageLayout>
    <div className='px-2 py-4 sm:px-10 sm:py-8'>
      <div className='mx-auto max-w-[95%]'>
        <div className='mb-4 flex items-end justify-between'>
          <div>
            <h1 className='text-xl font-bold text-gray-800 dark:text-gray-200'>短剧翻看</h1>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              来自各播放源的短剧分类，随便翻，点开即播
              {items.length ? ' · 共 ' + items.length + ' 部' : ''}
            </p>
          </div>
          <a href='/' className='flex-none text-sm text-green-600 dark:text-green-400'>回主页</a>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='按剧名筛选…'
          className='mb-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
        />
        <div className='mb-5 flex gap-2 overflow-x-auto pb-1'>
          <button className={chipCls(filter === 'all')} onClick={() => setFilter('all')}>全部</button>
          <button className={chipCls(filter === 'ai')} onClick={() => setFilter('ai')}>AI短剧</button>
          {sources.map((s) => (
            <button key={s} className={chipCls(filter === 'src:' + s)} onClick={() => setFilter('src:' + s)}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className='flex justify-center py-16'>
            <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
              <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-green-500'></div>
              正在从各播放源拉取短剧…
            </div>
          </div>
        ) : error ? (
          <div className='py-16 text-center text-gray-500 dark:text-gray-400'>{error}</div>
        ) : shown.length === 0 ? (
          <div className='py-16 text-center text-gray-500 dark:text-gray-400'>没有符合条件的短剧</div>
        ) : (
          <div className='grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-6'>
            {shown.map((i) => (
              <a key={i.title} href={'/search?q=' + encodeURIComponent(i.title)} className='group'>
                <div className='relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800'>
                  {i.pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.pic}
                      alt={i.title}
                      loading='lazy'
                      referrerPolicy='no-referrer'
                      className='h-full w-full object-cover transition group-hover:scale-105'
                    />
                  ) : null}
                </div>
                <div className='mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-gray-800 dark:text-gray-200'>
                  {i.title}
                </div>
                <div className='mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                  {i.remarks || i.cls} · {i.sources[0]}
                  {i.sources.length > 1 ? ' 等' + i.sources.length + '源' : ''}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageLayout>
  );
}
