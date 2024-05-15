import GiftLists from '@/components/cards/gift-lists';
import type { GetGiftListsSerachParams } from '../../page';

type DefaultGiftListsProps = {
  searchParams: GetGiftListsSerachParams;
};

async function DefaultGiftLists({ searchParams }: DefaultGiftListsProps) {
  return <GiftLists searchParams={searchParams} />;
}

export default DefaultGiftLists;
