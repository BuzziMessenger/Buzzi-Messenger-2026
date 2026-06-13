
import React from 'react';
import { Message } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onDeleteMessage: (msgId: string) => void;
  onBlockUser: (email: string) => void;
  onSendTestMessage: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onDeleteMessage, onBlockUser, onSendTestMessage }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Admin Control Panel</h2>
        <div className="space-y-4">
          <button onClick={onSendTestMessage} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Verstuur Testbericht</button>
          
          <div>
            <label className="block text-sm font-medium mb-1">Blokkeer email adres</label>
            <input type="text" id="block-email" className="w-full p-2 border rounded" placeholder="email@voorbeeld.nl" />
            <button onClick={() => {
              const email = (document.getElementById('block-email') as HTMLInputElement).value;
              if (email) onBlockUser(email);
            }} className="w-full mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700">Blokkeer deze gebruiker</button>
          </div>
          
          <button onClick={onClose} className="w-full bg-gray-300 text-black p-2 rounded hover:bg-gray-400">Sluiten</button>
        </div>
      </div>
    </div>
  );
};
