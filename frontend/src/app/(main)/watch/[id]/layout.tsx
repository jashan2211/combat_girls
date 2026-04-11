// Generate static params for all known video IDs from data.ts
export function generateStaticParams() {
  return [
    // Long-form videos
    'kg8Je8t8HQo', 'pZm4Wg5qFT0', 'JJL_wGBME48', 'EbS-fzLprBU',
    'g5wZd8KADKY', 'lPQCizd2meU', '63p0NRkbT5U', 'Ljt_wonnsyA',
    '9vk_y0cXUlk', '7ZyVxOi7CUo', '4vAYlTUUqOY', 'otsBRV53TvQ',
    // Shorts
    'T_p24EWx4is', '--TM7wCQFqQ', 'Iqkeszx4brU', '7p0WwzlsFwM',
    'qvYq5kxn6dc', 'EJ23am0wVC8', 'lwJNZPFTy1Q', 'w_GcUJj5u78',
    '5G6Z9loPkOk', 'QdlpCMcO3Xo', 'mOH29aDO4CM', 'ejLhewvzQww',
    'Kw5LNDRGskY', 'KVB4L9gZ3CI',
  ].map((id) => ({ id }));
}

export const dynamicParams = true;

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
