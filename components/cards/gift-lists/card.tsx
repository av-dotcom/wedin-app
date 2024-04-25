import { getGifts } from '@/actions/getGifts';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ringsLoader from '@/public/images/rings.svg';
import { formatPrice } from '@/utils/format';
import { GiftList } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { GoArrowRight } from 'react-icons/go';

type GiftListCardProps = {
  giftList: GiftList;
};

const GiftListCard = async ({ giftList }: GiftListCardProps) => {
  const { name, description, totalPrice, quantity, id } = giftList;
  const gifts = await getGifts({ searchParams: { giftListId: giftList.id } });
  const formattedPrice = formatPrice(Number(totalPrice));

  return (
    <div className="flex flex-col border-2 rounded-xl py-6 px-4 gap-4">
      <div className="relative">
        <Carousel>
          <CarouselContent>
            {gifts?.map((gift, index) => (
              <CarouselItem key={index}>
                <Image
                  src={gift.imageUrl || ringsLoader}
                  width={500}
                  height={0}
                  alt={gift.name}
                  className="border rounded-2xl h-[252px] w-full object-cover shadow"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="bg-white rounded-full px-5 py-1.5 flex items-center justify-center mt-4 mr-4 absolute top-0 right-0">
          {quantity} regalos
        </div>
      </div>

      <div className="flex flex-col flex-grow gap-1 w-full p-0">
        <h1 className="text-primaryTitleColor font-medium text-lg">{name}</h1>

        <p className="text-secondaryTextColor">{description}</p>
        <span className="text-black text-xl flex flex-grow items-end">
          {formattedPrice}
        </span>
      </div>

      <Link href={`/lists/${id}`}>
        <Button variant="primaryButton">
          Ver lista
          <GoArrowRight size={22} />
        </Button>
      </Link>
    </div>
  );
};

export default GiftListCard;
