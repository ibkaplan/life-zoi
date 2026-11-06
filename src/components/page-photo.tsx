import Image from "next/image";

const photos = {
  "life-matters": {
    src: "/pages/life-matters.webp",
    width: 1600,
    height: 1066,
    alt: "Tall purple wildflowers beside calm water, with soft hills beyond.",
    credit: "Camilla Bundgaard, CC0, via Wikimedia Commons.",
  },
  outlook: {
    src: "/pages/outlook.webp",
    width: 1600,
    height: 1200,
    alt: "A turquoise lake and snowy mountains under a bright blue sky.",
    credit: "Georgia Dixon, CC0, via Wikimedia Commons.",
  },
  "what-if": {
    src: "/pages/what-if.webp",
    width: 1600,
    height: 1066,
    alt: "A country lane splits into two tracks in warm evening light.",
    credit: "Francesco Gallarotti, CC0, via Wikimedia Commons.",
  },
  nutrition: {
    src: "/pages/nutrition.webp",
    width: 1600,
    height: 1066,
    alt: "A bowl of chopped vegetables, herbs, and peppers on a wooden board.",
    credit: "Monstruo Estudio, CC0, via Wikimedia Commons.",
  },
  movement: {
    src: "/pages/movement.webp",
    width: 1600,
    height: 1064,
    alt: "A woman walks alone down a tree-lined park path.",
    credit: "Biel Morro, CC0, via Wikimedia Commons.",
  },
  nature: {
    src: "/pages/nature.webp",
    width: 1200,
    height: 800,
    alt: "Tall trees seen from below, with blue sky between the leaves.",
    credit: "Magnus Lindvall, CC0, via Wikimedia Commons.",
  },
  progress: {
    src: "/pages/progress.webp",
    width: 1400,
    height: 980,
    alt: "Stone steps climb through green shrubs toward the light.",
    credit: "Jimmy Chang, CC0, via Wikimedia Commons.",
  },
  profile: {
    src: "/pages/profile.webp",
    width: 1600,
    height: 1062,
    alt: "An open book resting outdoors, with blank pages ready to fill.",
    credit: "Ben White, CC0, via Wikimedia Commons.",
  },
} as const;

export type PagePhotoId = keyof typeof photos;

export function PagePhoto({ id }: { id: PagePhotoId }) {
  const photo = photos[id];
  return (
    <figure className="page-photo">
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="(min-width: 900px) 1040px, 100vw"
      />
      <figcaption>{photo.credit}</figcaption>
    </figure>
  );
}
