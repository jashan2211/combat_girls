// Generate static params for all known video IDs
export function generateStaticParams() {
  return [
    'lPQCizd2meU', '63p0NRkbT5U', 'Ljt_wonnsyA', '9vk_y0cXUlk',
    '7ZyVxOi7CUo', '4vAYlTUUqOY', 'pZm4Wg5qFT0', 'JJL_wGBME48',
    'EbS-fzLprBU', 'g5wZd8KADKY', 'otsBRV53TvQ',
    '--TM7wCQFqQ', '7p0WwzlsFwM', 'lwJNZPFTy1Q', 'w_GcUJj5u78',
    'QdlpCMcO3Xo', 'ejLhewvzQww', 'mOH29aDO4CM', 'KVB4L9gZ3CI',
  ].map((id) => ({ id }));
}

export const dynamicParams = true;

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
