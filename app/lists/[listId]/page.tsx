import Container from '@/components/Container';
import { getCurrentUser } from '@/actions/getCurrentUser';
import { getGiftList } from '@/actions/getGiftList';
import { getWedding } from '@/actions/getWedding';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getWishList } from '@/actions/getWishList';
import AddToWishListButton from './AddToWishListButton';
import { getGifts } from '@/actions/getGifts';
import { IoGiftOutline } from 'react-icons/io5';
import { PiWallet } from 'react-icons/pi';
import { formatPrice } from '@/utils/format';
import { Suspense } from 'react';
import Gifts from '@/components/cards/gifts';

type GiftListPageProps = {
  params: {
    listId: string;
  };
};

export default async function GiftListPage({ params }: GiftListPageProps) {
  const { listId } = params;
  const currentUser = await getCurrentUser();
  const wedding = await getWedding(currentUser?.id);
  //const giftList = await getGiftList({ id: listId });
  const giftList = await getGiftList(listId);
  const gifts = await getGifts({ giftListId: listId });
  const giftIds = gifts?.map(gift => gift.id);

  if (!giftList) return null;

  const { name, quantity, totalPrice, description } = giftList;


  const formattedPrice = formatPrice(Number(totalPrice));

  return (
    <Container>
      <div className="min-h-[90vh] flex flex-col justify-start mt-12 sm:mt-12 px-4 sm:px-10">
        {/* <Breadcrumb className='mb-6'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/gifts">Listas pré-definidas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}

        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3 w-full ">
            <h1 className="text-4xl font-medium text-primaryTextColor">
              {name}
            </h1>
            <div className="flex items-center gap-3">
              <div className="bg-[#F2F2F2] rounded-full py-1.5 px-4 text-md flex items-center gap-2">
                <IoGiftOutline fontSize={'18px'} />
                {quantity} regalos
              </div>
              <div className="bg-[#F2F2F2] rounded-full py-1.5 px-4 text-md flex items-center gap-2">
                <PiWallet fontSize={'18px'} />
                {formattedPrice}
              </div>
            </div>
            <p className="text-xl text-center">
              {/* Elegí esta lista pré-definida, podes personalizarla más adelante */}
              {description}
            </p>
          </div>

          <div className="w-full flex justify-center">
            <AddToWishListButton
              currentUser={currentUser}
              wishListId={wedding?.wishListId}
              giftIds={giftIds}
            />
          </div>
        </div>

        <div className="flex justify-center items-center mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
            <Suspense fallback={<div>Loading...</div>}>
              <Gifts searchParams={{ giftListId: listId }} hideButton />
            </Suspense>
          </div>
        </div>
      </div>
    </Container>
  );
}
