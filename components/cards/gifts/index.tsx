import { getGifts } from '@/actions/data/gift';
import { getWedding } from '@/actions/data/wedding';
import { getCurrentUser } from '@/actions/getCurrentUser';
import { GiftListSearchParams } from '@/app/(default)/giftLists/[giftListId]/page';
import { GiftPageSearchParams } from '@/app/(default)/gifts/page';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { Suspense } from 'react';
import CardContainer from '../shared/card-container';
import GiftCard from './card';

type GiftsProps = {
  searchParams: GiftPageSearchParams | GiftListSearchParams;
};

async function Gifts({ searchParams }: GiftsProps) {
  const gifts = await getGifts({ searchParams });

  if (gifts?.length === 0 || !gifts)
    return <EmptyState title="No se encontraron regalos" />;

  const currentUser = await getCurrentUser();
  const wedding = await getWedding(currentUser?.id);

  return (
    <CardContainer>
      <Suspense fallback={<Loader />}>
        {gifts.map(gift => (
          <GiftCard
            key={gift.id}
            gift={gift}
            wishlistId={wedding?.wishListId}
          />
        ))}
      </Suspense>
    </CardContainer>
  );
}

export default Gifts;
