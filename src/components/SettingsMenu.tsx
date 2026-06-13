import React from "react";
import { themes } from "../utils/themes";
import { X, Palette, Volume2, Bell, Download } from "lucide-react";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  const downloadApk = () => {
    window.location.href = "/api/download/apk";
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Instellingen</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Thema's</h3>
            <div className="grid grid-cols-1 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`p-2 rounded text-left border ${currentTheme === theme.id ? "border-sky-500 bg-sky-50" : "border-slate-200"}`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Download className="w-4 h-4" /> Android App</h3>
            <button
                onClick={downloadApk}
                className="bg-sky-600 text-white text-xs px-2 py-1 rounded hover:bg-sky-700"
            >
                Download Installatie
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Geluid</h3>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Meldingen</h3>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};
