type Props = {
  title: string;
  photo: string;
  photoAlt: string;
};

/** Hero image with day title only — no extra copy. */
export default function DayHero({ title, photo, photoAlt }: Props) {
  return (
    <div className="relative w-full">
      <div className="relative h-56 sm:h-72 md:h-[340px] w-full overflow-hidden">
        <img src={photo} alt={photoAlt} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/35 to-stone-900/10" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-16">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
