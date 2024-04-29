'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { useDebounceCallback } from 'usehooks-ts';

type SearchProps = {};

function SearchBar({}: SearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounce = useDebounceCallback(handleSearchTitle, 1000);
  const name = searchParams.get('name') ?? '';

  function handleSearchTitle(value: string) {
    const sp = new URLSearchParams(searchParams);

    if (value.trim() === '') {
      sp.delete('name');
    } else {
      sp.set('name', value);
      sp.set('page', '1');
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex gap-2 items-center py-1.5 pr-1.5 pl-4 my-8 w-full rounded-full md:w-auto bg-secondaryBackgroundColor">
      <BiSearch fontSize={'22px'} />
      <Input
        className="pl-2 bg-transparent rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Buscar"
        onChange={e => debounce(e.target.value)}
        defaultValue={name}
      />
    </div>
  );
}

export default SearchBar;
