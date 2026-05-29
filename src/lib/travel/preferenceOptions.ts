/**
 * Grouped preference options — universal taxonomy (8 sections + budget).
 */
import type { LucideIcon } from 'lucide-react';
import {
  Mountain,
  Trees,
  Waves,
  Bird,
  Camera,
  TreePine,
  Landmark,
  GalleryVertical,
  Building2,
  Pickaxe,
  Scroll,
  MapPin,
  PartyPopper,
  Hammer,
  UtensilsCrossed,
  Sandwich,
  Wine,
  Store,
  Coffee,
  Shirt,
  Sparkles,
  Heart,
  Footprints,
  Bike,
  Zap,
  Compass,
  Baby,
  User,
  HeartHandshake,
  Users,
  Gauge,
  Wallet,
  CircleDollarSign,
  Gem,
  Castle,
  BookOpen,
} from 'lucide-react';
import type { TravelThemeId } from '../../types/travelState';

export type ThemeOption = {
  id: TravelThemeId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type PreferenceSection = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  options: ThemeOption[];
  /** Section 6 also renders pace/style chips separately */
  includesPace?: boolean;
};

export const PREFERENCE_SECTIONS: PreferenceSection[] = [
  {
    id: 'landscapes',
    emoji: '🏞️',
    title: 'Paesaggi & Natura',
    subtitle: 'Valido ovunque — seleziona ciò che ti attira',
    options: [
      {
        id: 'nature',
        label: 'Natura',
        description: 'Paesaggi verdi, sentieri e ambienti naturali in ogni destinazione.',
        icon: Trees,
      },
      {
        id: 'mountains',
        label: 'Montagna',
        description: 'Altitudine, panorami alpini o montuosi e borghi d’altura.',
        icon: Mountain,
      },
      {
        id: 'beach',
        label: 'Mare',
        description: 'Coste, spiagge e life by the sea — dal Mediterraneo ai tropici.',
        icon: Waves,
      },
      {
        id: 'wildlife',
        label: 'Fauna',
        description: 'Osservazione animali, riserve e biodiversità locale.',
        icon: Bird,
      },
      {
        id: 'nature_photo',
        label: 'Fotonatura',
        description: 'Scatti naturalistici, belvedere e luce sul paesaggio.',
        icon: Camera,
      },
      {
        id: 'parks',
        label: 'Parchi',
        description: 'Parchi nazionali, riserve protette e aree naturalistiche.',
        icon: TreePine,
      },
    ],
  },
  {
    id: 'heritage',
    emoji: '🎨',
    title: 'Arte & Patrimonio',
    subtitle: 'Struttura fissa — contenuti adattati al paese (es. Rinascimento in Italia, templi in Giappone)',
    options: [
      {
        id: 'art_ancient',
        label: 'Antica',
        description: 'Arte antica e tradizionale del paese: stili storici e patrimonio artistico locale.',
        icon: Landmark,
      },
      {
        id: 'art_modern',
        label: 'Moderna',
        description: 'Arte moderna e contemporanea, scena creativa e installazioni.',
        icon: GalleryVertical,
      },
      {
        id: 'museums',
        label: 'Musei',
        description: 'Musei, gallerie e collezioni — cuore culturale della destinazione.',
        icon: Castle,
      },
      {
        id: 'architecture',
        label: 'Architettura',
        description: 'Architettura iconica: dal medievale al contemporaneo, locale per locale.',
        icon: Building2,
      },
      {
        id: 'archaeology',
        label: 'Archeo',
        description: 'Siti archeologici e stratificazioni storiche del territorio.',
        icon: Pickaxe,
      },
    ],
  },
  {
    id: 'history',
    emoji: '📚',
    title: 'Storia & Tradizioni',
    subtitle: 'Epoche e usanze locali — si adattano automaticamente alla destinazione',
    options: [
      {
        id: 'history_eras',
        label: 'Epoche',
        description: 'Interesse per periodi storici chiave del paese (es. Medioevo, Edo, Moghul).',
        icon: Scroll,
      },
      {
        id: 'historic_sites',
        label: 'Siti',
        description: 'Monumenti, centri storici e luoghi simbolo del passato.',
        icon: MapPin,
      },
      {
        id: 'traditions',
        label: 'Tradizioni',
        description: 'Folklore, usanze e vita quotidiana autentica.',
        icon: BookOpen,
      },
      {
        id: 'crafts',
        label: 'Artigianato',
        description: 'Artigianato locale, botteghe e savoir-faire tradizionale.',
        icon: Hammer,
      },
      {
        id: 'festivals',
        label: 'Feste',
        description: 'Eventi culturali, festival e celebrazioni stagionali.',
        icon: PartyPopper,
      },
    ],
  },
  {
    id: 'food',
    emoji: '🍽️',
    title: 'Cibo & Gastronomia',
    subtitle: 'Valido ovunque, senza modifiche',
    options: [
      {
        id: 'local_food',
        label: 'Cucina',
        description: 'Piatti tipici, trattorie e cucina regionale autentica.',
        icon: UtensilsCrossed,
      },
      {
        id: 'street_food',
        label: 'Street',
        description: 'Cibo di strada, mercati gastronomici e quick bites locali.',
        icon: Sandwich,
      },
      {
        id: 'tastings',
        label: 'Degustazioni',
        description: 'Degustazioni: vino, birra, caffè, formaggi o prodotti del territorio.',
        icon: Wine,
      },
      {
        id: 'food_markets',
        label: 'Mercati',
        description: 'Mercati alimentari, prodotti tipici e ingredienti locali.',
        icon: Store,
      },
    ],
  },
  {
    id: 'lifestyle',
    emoji: '🌃',
    title: 'Vita & Lifestyle',
    subtitle: 'Valido ovunque',
    options: [
      {
        id: 'nightlife',
        label: 'Notte',
        description: 'Serate, locali, musica e vita notturna.',
        icon: Wine,
      },
      {
        id: 'shopping',
        label: 'Shop',
        description: 'Boutique, mercati e vie dello shopping.',
        icon: Store,
      },
      {
        id: 'cafes',
        label: 'Caffè',
        description: 'Caffè, bar tipici e rituali sociali locali.',
        icon: Coffee,
      },
      {
        id: 'design_fashion',
        label: 'Moda',
        description: 'Design, moda e quartieri creativi.',
        icon: Shirt,
      },
    ],
  },
  {
    id: 'pace',
    emoji: '🧘',
    title: 'Ritmo & Benessere',
    subtitle: 'Preferenze di ritmo + benessere — scegli anche il passo del viaggio',
    includesPace: true,
    options: [
      {
        id: 'relax',
        label: 'Relax',
        description: 'Atmosfera distensiva, meno fretta e più pausa.',
        icon: Sparkles,
      },
      {
        id: 'wellness',
        label: 'Benessere',
        description: 'Spa, terme, trattamenti e rigenerazione.',
        icon: Heart,
      },
    ],
  },
  {
    id: 'adventure',
    emoji: '🧭',
    title: 'Avventura & Attività',
    subtitle: 'Valido ovunque',
    options: [
      {
        id: 'trekking',
        label: 'Trekking',
        description: 'Escursioni a piedi, sentieri e trekking day o multi-day.',
        icon: Footprints,
      },
      {
        id: 'outdoor_sports',
        label: 'Outdoor',
        description: 'Sport all’aperto: ciclismo, kayak, sci, immersioni e altro.',
        icon: Bike,
      },
      {
        id: 'adrenaline',
        label: 'Adrenalina',
        description: 'Esperienze adrenaliniche e attività ad alto impatto.',
        icon: Zap,
      },
      {
        id: 'exploration',
        label: 'Esplorazioni',
        description: 'Scoperta libera, percorsi insoliti e luoghi meno battuti.',
        icon: Compass,
      },
    ],
  },
  {
    id: 'target',
    emoji: '👨‍👩‍👧',
    title: 'Viaggio & Target',
    subtitle: 'Per chi è pensato il viaggio',
    options: [
      {
        id: 'family',
        label: 'Famiglia',
        description: 'Family-friendly: accessibilità, bambini e ritmi adatti.',
        icon: Baby,
      },
      {
        id: 'solo',
        label: 'Solo',
        description: 'Viaggio in solitaria, flessibilità e autonomia.',
        icon: User,
      },
      {
        id: 'couples',
        label: 'Coppie',
        description: 'Romanticismo, intimità e esperienze per due.',
        icon: HeartHandshake,
      },
      {
        id: 'friends',
        label: 'Amici',
        description: 'Gruppo di amici, socialità e attività condivise.',
        icon: Users,
      },
    ],
  },
];

/** @deprecated use PREFERENCE_SECTIONS */
export const THEME_GROUPS = PREFERENCE_SECTIONS.map((s) => ({
  title: `${s.emoji} ${s.title}`,
  hint: s.subtitle,
  options: s.options,
}));

export const ALL_THEME_OPTIONS: ThemeOption[] = PREFERENCE_SECTIONS.flatMap((s) => s.options);

export const THEME_CHIP_WIDTH_CH = Math.max(...ALL_THEME_OPTIONS.map((o) => o.label.length)) + 1;

export type SingleChoiceOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const STYLE_OPTIONS: SingleChoiceOption[] = [
  {
    id: 'lento',
    label: 'Lento',
    description: 'Poche tappe, più tempo in ogni luogo.',
    icon: Sparkles,
  },
  {
    id: 'equilibrato',
    label: 'Equo',
    description: 'Mix equilibrato tra visite e riposo.',
    icon: Gauge,
  },
  {
    id: 'intenso',
    label: 'Intenso',
    description: 'Ritmo sostenuto, molte esperienze.',
    icon: Compass,
  },
];

export const BUDGET_OPTIONS: SingleChoiceOption[] = [
  {
    id: 'economico',
    label: 'Economico',
    description: 'Priorità al risparmio su alloggi e scelte.',
    icon: Wallet,
  },
  {
    id: 'medio',
    label: 'Medio',
    description: 'Buon equilibrio qualità/prezzo.',
    icon: CircleDollarSign,
  },
  {
    id: 'alto',
    label: 'Alto',
    description: 'Più comfort e scelte premium.',
    icon: Gem,
  },
];

export const SINGLE_CHIP_WIDTH_CH = Math.max(
  ...STYLE_OPTIONS.map((o) => o.label.length),
  ...BUDGET_OPTIONS.map((o) => o.label.length)
) + 1;
