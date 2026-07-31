'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ImageRef } from '@/lib/content/types'
import { isVectorAsset } from '@/lib/utils/format'

/**
 * عارض الصور مبني على عنصر `<dialog>` الأصلي لا على مكتبة.
 *
 * المتصفح يتكفّل بحصر التركيز والإغلاق بـ Esc وتعطيل الخلفية وإعادة
 * التركيز إلى الزر المصدر — وهو ما كنّا نستورد ١٤ كيلوبايت مضغوطة
 * لتحقيقه. أقل كوداً وأقرب إلى سلوك المنصة (SPEC §10.1).
 */
export function CertificateLightbox({
  image,
  title,
  triggerLabel,
  closeLabel,
}: {
  image: ImageRef
  title: string
  triggerLabel: string
  closeLabel: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [supportsModal, setSupportsModal] = useState(true)

  useEffect(() => {
    setSupportsModal(typeof HTMLDialogElement !== 'undefined')
  }, [])

  const open = useCallback(() => {
    dialogRef.current?.showModal()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // النقر على الخلفية خارج الصورة يغلق العارض
  const onBackdropClick = useCallback((event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) dialogRef.current.close()
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={!supportsModal}
        className="group block w-full bg-bg-elevated p-3 text-start"
        aria-label={`${triggerLabel}: ${title}`}
      >
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width ?? 800}
          height={image.height ?? 566}
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={isVectorAsset(image.url)}
          className="h-auto w-full rounded-sm transition-transform duration-250 group-hover:scale-[1.02]"
        />
      </button>

      <dialog
        ref={dialogRef}
        onClick={onBackdropClick}
        aria-label={title}
        className="max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4 p-4">
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width ?? 800}
            height={image.height ?? 566}
            unoptimized={isVectorAsset(image.url)}
            className="max-h-[80dvh] w-auto max-w-full rounded-md bg-white"
          />

          <button
            type="button"
            onClick={close}
            className="rounded-sm bg-surface px-4 py-2 text-xs font-semibold text-fg"
          >
            {closeLabel}
          </button>
        </div>
      </dialog>
    </>
  )
}
