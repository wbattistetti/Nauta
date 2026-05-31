/**
 * Accordion header title — underlined action word signals clickability.
 */
type Props = {
  actionWord: string;
  rest: string;
};

export default function AccordionActionTitle({ actionWord, rest }: Props) {
  return (
    <span className="text-sm font-medium text-amber-50 leading-snug">
      <span className="underline decoration-amber-400/90 decoration-2 underline-offset-[3px]">
        {actionWord}
      </span>
      {rest}
    </span>
  );
}
