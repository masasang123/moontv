'use client';

import { useEffect, useState } from 'react';

import VideoCard from '@/components/VideoCard';

interface DuanjuItem {
  title: string;
  pic: string;
  remarks: string;
  cls: string;
  sources: string[];
  time: string;
}

export default function DuanjuShelf() {
  const [items, setItems] = useState<DuanjuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/duanju')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d) => {
        setItems((d.items || []).slice(0, 12));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className='mb-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>短剧</h2>
        <a
          href='/duanju'
          className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          查看全部
        </a>
      </div>
      {loading ? (
        <div className='flex justify-center py-8'>
          <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-green-500'></div>
            <span className='text-sm'>加载中...</span>
          </div>
        </div>
      ) : (
        <div className='justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8'>
          {items.map((item) => (
            <div key={item.title} className='w-full'>
              <VideoCard title={item.title} poster={item.pic} from='douban' />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
