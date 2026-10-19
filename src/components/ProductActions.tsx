"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useCart } from "@/lib/cart";
import { whatsappHref } from "@/lib/site";

export function ProductActions({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { add } = useCart();
  const { dict, href } = useI18n();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => {
          add(slug);
          setAdded(true);
        }}
        className="btn-solid"
      >
        {added ? dict.product.inCart : dict.product.add}
      </button>
      {added ? (
        <Link href={href("/korpa")} className="btn-line">
          {dict.product.viewCart}
        </Link>
      ) : (
        <a
          href={whatsappHref(dict.product.waOrder.replace("{name}", name))}
          target="_blank"
          rel="noreferrer"
          className="btn-line"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}
