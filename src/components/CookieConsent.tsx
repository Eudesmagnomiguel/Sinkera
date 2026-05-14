import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KEY = 'sinkera_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      // Small delay so it doesn't pop up while the page is loading
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-4.5 h-4.5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Utilizamos cookies</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Usamos cookies essenciais para o funcionamento da loja e, com o teu consentimento, cookies analíticos para melhorar a experiência.
            Consulta a nossa{' '}
            <Link to="/privacidade" className="underline hover:text-foreground transition-colors" onClick={accept}>
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none rounded-xl text-xs" onClick={reject}>
            Rejeitar
          </Button>
          <Button size="sm" variant="vibrant" className="flex-1 sm:flex-none rounded-xl text-xs" onClick={accept}>
            Aceitar tudo
          </Button>
          <button
            onClick={reject}
            className="ml-1 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
