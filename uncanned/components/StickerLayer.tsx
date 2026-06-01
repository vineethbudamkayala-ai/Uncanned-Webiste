"use client";

import Image from "next/image";

export default function StickerLayer({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <div
      className={`sticker-layer ${
        visible ? "show" : ""
      }`}
      aria-hidden="true"
    >
        <Image
  src="/stickers/Better-soda-phone.png"
  alt=""
  width={420}
  height={360}
  className="sticker sticker-phone"
/>

<Image
  src="/stickers/ticket_stub.png"
  alt=""
  width={428}
  height={326}
  className="sticker sticker-ticket"
/>

<Image
  src="/stickers/Juice-glass.png"
  alt=""
  width={390}
  height={328}
  className="sticker sticker-soda"
/>

<Image
  src="/stickers/Un-stamp.png"
  alt=""
  width={324}
  height={302}
  className="sticker sticker-stamp"
/>

<Image
  src="/stickers/Strawberry.png"
  alt=""
  width={240}
  height={240}
  className="sticker sticker-strawberry"
/>

<Image
  src="/stickers/dumbbells.png"
  alt=""
  width={330}
  height={250}
  className="sticker sticker-dumbbells"
/>

<Image
  src="/stickers/Skateboard.png"
  alt=""
  width={420}
  height={180}
  className="sticker sticker-skateboard"
/>
        </div>
  );
}