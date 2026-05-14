import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

export default function Privacidade() {
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={search} setSearchQuery={setSearch} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Legal</p>
          <h1 className="text-3xl font-black text-foreground">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última actualização: Maio de 2025</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">1. Quem somos</h2>
            <p>
              A Sinkera é uma plataforma de comércio electrónico sediada em Luanda, Angola, que disponibiliza produtos
              tecnológicos, electrodomésticos e outros bens de consumo para todo o território nacional.
              Ao utilizar o nosso site <strong className="text-foreground">sinkera.ao</strong>, aceita os termos desta política.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">2. Dados que recolhemos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Nome completo e endereço de email (registo e autenticação)</li>
              <li>Número de telefone (para entrega e suporte)</li>
              <li>Endereço de entrega (morada, cidade, província)</li>
              <li>Histórico de encomendas e preferências de compra</li>
              <li>Dados de navegação e cookies de sessão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">3. Como utilizamos os seus dados</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Processar e entregar as suas encomendas</li>
              <li>Enviar notificações sobre o estado do pedido</li>
              <li>Personalizar a sua experiência de compra</li>
              <li>Enviar comunicações promocionais (apenas com consentimento)</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">4. Partilha de dados</h2>
            <p>
              Não vendemos os seus dados a terceiros. Partilhamos informação apenas com:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Parceiros logísticos responsáveis pela entrega</li>
              <li>Processadores de pagamento (Multicaixa Express / bancos)</li>
              <li>Fornecedores de infraestrutura (Supabase — armazenamento seguro na UE)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">5. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da loja (sessão, carrinho) e cookies analíticos para
              melhorar a experiência. Pode gerir as suas preferências através do banner de cookies ou nas definições
              do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">6. Retenção de dados</h2>
            <p>
              Conservamos os seus dados enquanto mantiver conta activa. Após eliminação da conta, os dados são
              anonimizados no prazo de 30 dias, salvo obrigação legal em contrário.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">7. Os seus direitos</h2>
            <p>Tem direito a:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Aceder, rectificar ou eliminar os seus dados</li>
              <li>Opor-se ao tratamento para fins de marketing</li>
              <li>Solicitar portabilidade dos seus dados</li>
            </ul>
            <p className="mt-2">
              Para exercer estes direitos contacte-nos em{' '}
              <a href="mailto:privacidade@sinkera.ao" className="text-primary hover:underline">privacidade@sinkera.ao</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">8. Contacto</h2>
            <p>
              Sinkera · Luanda, Angola · <a href="mailto:suporte@sinkera.ao" className="text-primary hover:underline">suporte@sinkera.ao</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
