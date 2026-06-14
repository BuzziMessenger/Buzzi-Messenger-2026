import { useEffect } from 'react';

export const SupportKofi = () => {
    useEffect(() => {
        const initKofi = () => {
            // @ts-ignore
            if (window.kofiWidgetOverlay && typeof window.kofiWidgetOverlay.draw === 'function') {
                // @ts-ignore
                window.kofiWidgetOverlay.draw('buzzimessenger', {
                    'type': 'floating-chat',
                    'floating-chat.donateButton.text': 'Steun Buzzi',
                    'floating-chat.donateButton.background-color': '#00b9fe',
                    'floating-chat.donateButton.text-color': '#fff'
                });
            }
        };

        // If script already exists, try initializing immediately
        if (document.getElementById('kofi-widget-script')) {
            initKofi();
        } else {
            const script = document.createElement('script');
            script.id = 'kofi-widget-script';
            script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
            script.async = true;
            script.onload = initKofi;
            document.body.appendChild(script);
        }

        // Cleanup: Remove widget elements on unmount
        return () => {
            const elements = document.querySelectorAll('.kofi-widget-wrapper, .kofi-chat-container');
            elements.forEach((el) => {
                el.remove();
            });
        };
    }, []);

    return null;
};
