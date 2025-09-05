import React, { useEffect } from 'react';
import { coupleService } from '../api';

export default function Home() {
  useEffect(() => {
    (async () => {
      try {
        const cm = await coupleService.me();
        if (!cm.in_couple) {
          window.location.href = '/onboarding-couple';
        }
      } catch {
        // 409 géré par l’intercepteur
      }
    })();
  }, []);

  return (
    <div>
      <h1>Bienvenue dans l’app</h1>
      <p>Votre espace de couple est prêt 🎉</p>
    </div>
  );
}
