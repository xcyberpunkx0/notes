export interface FontOption {
  key: string;
  label: string;
  family: string;
  group: "Clean & clear" | "Serif & script" | "Handwritten";
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: "instrument",
    label: "Instrument Sans (default)",
    family: '"Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif',
    group: "Clean & clear",
  },
  {
    key: "calibri",
    label: "Calibri",
    family: 'Calibri, "Segoe UI", sans-serif',
    group: "Clean & clear",
  },
  {
    key: "arial",
    label: "Arial",
    family: "Arial, Helvetica, sans-serif",
    group: "Clean & clear",
  },
  {
    key: "open-sans",
    label: "Open Sans",
    family: '"Open Sans Variable", sans-serif',
    group: "Clean & clear",
  },
  {
    key: "roboto",
    label: "Roboto",
    family: '"Roboto Variable", sans-serif',
    group: "Clean & clear",
  },
  {
    key: "pt-serif",
    label: "PT Serif",
    family: '"PT Serif", Georgia, serif',
    group: "Serif & script",
  },
  {
    key: "tangerine",
    label: "Tangerine",
    family: '"Tangerine", cursive',
    group: "Serif & script",
  },
  {
    key: "caveat",
    label: "Caveat",
    family: '"Caveat Variable", cursive',
    group: "Handwritten",
  },
  {
    key: "gaegu",
    label: "Gaegu",
    family: '"Gaegu", cursive',
    group: "Handwritten",
  },
  {
    key: "patrick-hand",
    label: "Patrick Hand (simple handwriting)",
    family: '"Patrick Hand", cursive',
    group: "Handwritten",
  },
];

export function fontFamilyFor(key: string): string {
  return (
    FONT_OPTIONS.find((f) => f.key === key)?.family ?? FONT_OPTIONS[0].family
  );
}
