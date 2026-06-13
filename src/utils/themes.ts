export type Theme = {
  id: string;
  name: string;
  bgMain: string;
  bgSidebar: string;
  bgHeader: string;
  textMain: string;
  accent: string;
};

export const themes: Theme[] = [
  {
    id: "buzzi-classic",
    name: "Buzzi Classic (2004)",
    bgMain: "bg-slate-50",
    bgSidebar: "bg-[#e4ecf7]",
    bgHeader: "bg-[#cbdcf0]",
    textMain: "text-slate-800",
    accent: "bg-[#1d5c8a]",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    bgMain: "bg-slate-900",
    bgSidebar: "bg-slate-800",
    bgHeader: "bg-slate-700",
    textMain: "text-slate-100",
    accent: "bg-sky-600",
  },
  {
    id: "retro-pink",
    name: "Retro Pink",
    bgMain: "bg-pink-50",
    bgSidebar: "bg-pink-100",
    bgHeader: "bg-pink-200",
    textMain: "text-pink-900",
    accent: "bg-pink-600",
  },
  {
    id: "windows-98",
    name: "Retro Desktop (Win98)",
    bgMain: "bg-gray-300",
    bgSidebar: "bg-gray-200",
    bgHeader: "bg-teal-700",
    textMain: "text-black",
    accent: "bg-teal-600",
  },
  {
    id: "breezer-pastel",
    name: "Breezer Pastel",
    bgMain: "bg-indigo-50",
    bgSidebar: "bg-indigo-100",
    bgHeader: "bg-indigo-200",
    textMain: "text-indigo-900",
    accent: "bg-indigo-400",
  }
];
