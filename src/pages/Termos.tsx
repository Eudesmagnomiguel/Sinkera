import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

export default function Termos() {
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={search} setSearchQuery={setSearch} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Legal</p>
          <h1 className="text-3xl font-black text-foreground">Termos e Condições</h1>
          <p className="text-sm text-muted-foreground">Última actualização: Maio de 2025</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao aceder ou utilizar a plataforma Sinkera (<strong className="text-foreground">sinkera.ao</strong>),
              concorda com estes Termos e Condições na íntegra. Caso não concorde, não deverá utilizar os nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">2. Conta de utilizador</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Deve ter pelo menos 18 anos ou autorização de um responsável legal</li>
              <li>É responsável pela confidencialidade das suas credenciais</li>
              <li>Uma conta por pessoa; contas múltiplas ou fraudulentas serão encerradas</li>
              <li>Informe-nos imediatamente de qualquer acesso não autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">3. Encomendas e Pagamento</h2>
            <p>
              A confirmação de encomenda está sujeita à disponibilidade de stock e verificação do pagamento.
              Aceitamos pagamentos via <strong className="text-foreground">Multicaixa Express</strong> e
              {' '}<strong className="text-foreground">Transferência Bancária</strong>.
              O pagamento deve ser confirmado antes do processamento da encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">4. Entrega</h2>
            <p>
              Os prazos de entrega são estimativas e podem variar consoante a localização e disponibilidade logística.
              A Sinkera não se responsabiliza por atrasos causados por factores externos (greves, calamidades, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">5. Trocas e Devoluções</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Produtos com defeito de fábrica: troca em 7 dias após recepção</li>
              <li>Produto diferente do anunciado: devolução total em 14 dias</li>
              <li>O produto deve ser devolvido na embalagem original e sem sinais de uso</li>
              <li>Contacte o suporte em <a href="mailto:suporte@sinkera.ao" className="text-primary hover:underline">suporte@sinkera.ao</a> para iniciar o processo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">6. Programa de Parceiros</h2>
            <p>
              Os parceiros e revendedores (resellers) devem cumprir o Acordo de Parceria celebrado com a Sinkera.
              Todos os produtos submetidos por parceiros passam por curadoria interna antes de serem publicados.
              A Sinkera reserva-se o direito de remover produtos que violem as políticas da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma (logótipos, textos, imagens, código) é propriedade da Sinkera ou
              licenciado por terceiros. A reprodução sem autorização é proibida.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">8. Limitação de Responsabilidade</h2>
            <p>
              A Sinkera não se responsabiliza por danos indirectos ou lucros cessantes decorrentes do uso da plataforma.
              A nossa responsabilidade máxima limita-se ao valor da encomenda em causa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">9. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pela lei angolana. Qualquer litígio será submetido aos tribunais competentes
              de Luanda, Angola.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">10. Contacto</h2>
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
