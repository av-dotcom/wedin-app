'use client';

import { updateGiftImageUrl } from '@/actions/data/gift';
import { createGiftToWishList } from '@/actions/data/wishlist';
import { getSignedURL } from '@/actions/upload-to-s3';
import GiftForm from '@/components/forms/shared/gift-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { computeSHA256 } from '@/lib/utils';
import { GiftSchema } from '@/schemas/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoGiftOutline } from 'react-icons/io5';
import type { z } from 'zod';

type CreateGiftFormProps = {
  wishlistId: string;
  categories: Category[];
};

function CreateGiftForm({ categories, wishlistId }: CreateGiftFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(GiftSchema),
    defaultValues: {
      id: '',
      name: '',
      categoryId: '',
      price: '',
      isFavoriteGift: false,
      isGroupGift: false,
      wishListId: wishlistId,
    },
  });

  const onSubmit = async (values: z.infer<typeof GiftSchema>) => {
    setIsLoading(true);
    const validatedFields = GiftSchema.safeParse(values);

    if (!validatedFields.success || !selectedFile) {
      toast({
        title: 'Validation Error',
        description: 'Please check your input and try again.',
        className: 'bg-white',
      });

      setIsLoading(false);
      return;
    }

    const giftCreateResponse = await createGiftToWishList(
      validatedFields.data
      // selectedFile
    );

    if (giftCreateResponse.error || !giftCreateResponse.gift) {
      toast({
        variant: 'destructive',
        title: 'error al crear el regalo',
        description: giftCreateResponse.error,
      });

      setIsLoading(false);
      return;
    }

    // have a upload image function

    const checksum = await computeSHA256(selectedFile);

    const presignResponse = await getSignedURL({
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
      giftId: giftCreateResponse.gift.id,
      checksum: checksum,
    });

    if (presignResponse.error || !presignResponse?.success?.url) {
      setError('Error al subir la imagen');
      toast({
        variant: 'destructive',
        title: 'Error al conseguir presign URL',
        description: presignResponse.error,
      });

      setIsLoading(false);
      return;
    }

    const imageUrl = presignResponse.success.url.split('?')[0];

    const awsImagePosting = await fetch(imageUrl, {
      method: 'PUT',
      body: selectedFile,
      headers: {
        'Content-Type': selectedFile.type,
        metadata: JSON.stringify({ giftId: giftCreateResponse.gift.id }),
      },
    });

    if (!awsImagePosting.ok) {
      setError('Error al subir la imagen a AWS');
      toast({
        variant: 'destructive',
        title: 'error al subir la imagen a AWS',
        description: presignResponse.error,
      });

      setIsLoading(false);
      return;
    }

    await updateGiftImageUrl(imageUrl, giftCreateResponse.gift.id);

    toast({
      title: 'Éxito! 🎁🗑',
      description: giftCreateResponse.success,
      action: (
        <Button
          onClick={() => router.push('/dashboard?page=1')}
          variant="outline"
          className="gap-1 px-3 h-8 hover:text-white border-borderColor hover:bg-primaryBackgroundColor"
        >
          <IoGiftOutline />
          Ver lista
        </Button>
      ),
      className: 'bg-white',
    });
    setIsLoading(false);
    return;
  };

  return (
    <GiftForm
      categories={categories}
      error={error}
      fileInputRef={fileInputRef}
      form={form}
      isLoading={isLoading}
      onSubmit={onSubmit}
      previewUrl={previewUrl}
      setError={setError}
      setPreviewUrl={setPreviewUrl}
      setSelectedFile={setSelectedFile}
    />
  );
}

export default CreateGiftForm;
