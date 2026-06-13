import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Theme } from '../utils/themes';

interface UserProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: Theme;
  userDisplayName: string;
  onUpdateDisplayName: (name: string) => void;
  userPersonalMessage: string;
  onUpdatePersonalMessage: (msg: string) => void;
  userAvatar: string;
  onUpdateAvatar: (avatar: string) => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ 
  isOpen, 
  onClose, 
  activeTheme,
  userDisplayName,
  onUpdateDisplayName,
  userPersonalMessage,
  onUpdatePersonalMessage,
  userAvatar,
  onUpdateAvatar
}) => {
  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onUpdateAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className={`${activeTheme.bgSidebar} ${activeTheme.textMain} p-6 rounded-2xl w-full max-w-sm shadow-2xl border-2 border-white/10`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Gebruikersinstellingen</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full cursor-pointer"><X size={20}/></button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 bg-white p-1 rounded-full border-4 border-white/20 shadow-md flex items-center justify-center overflow-hidden">
                {userAvatar.startsWith("data:") || userAvatar.startsWith("http") ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-5xl">{userAvatar}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-sky-600 p-2 rounded-full border-2 border-white cursor-pointer hover:bg-sky-700">
                <Camera size={16} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">Schermnaam</label>
            <input 
              type="text" 
              value={userDisplayName} 
              onChange={(e) => onUpdateDisplayName(e.target.value)}
              className="w-full text-sm p-2 rounded bg-white/10 border border-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">Statusbericht</label>
            <input 
              type="text" 
              value={userPersonalMessage} 
              onChange={(e) => onUpdatePersonalMessage(e.target.value)}
              className="w-full text-sm p-2 rounded bg-white/10 border border-white/20 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className={`w-full mt-4 py-2 rounded-lg font-bold ${activeTheme.accent} text-white`}>
            Opslaan & Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
