
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface CharacterHelperProps {
    onInteract?: () => void;
}

export const CharacterHelper: React.FC<CharacterHelperProps> = ({ onInteract }) => {
    const { t } = useLanguage();

    return (
        <div
            className="fixed z-50 transition-all duration-1000 ease-in-out pointer-events-none"
            style={{
                left: '10%',
                top: '80%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div className="relative group cursor-pointer pointer-events-auto" onClick={onInteract}>
                <img
                    src="/character.png"
                    alt="Character"
                    className="w-48 h-auto drop-shadow-2xl animate-bounce-slow"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />

                <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-2xl rounded-bl-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    <p className="font-bold text-sm">{t('game.characterHint')}</p>
                </div>
            </div>
        </div>
    );
};

export default CharacterHelper;
