import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import sinkeraLogo from "@/assets/sinkera-logo-white.png";
import paymentMulticaixa from "@/assets/payment-multicaixa.webp";
import paymentBankTransfer from "@/assets/payment-bank-transfer.webp";
import paymentVisaMastercard from "@/assets/payment-visa-mastercard.webp";

export const Footer = () => {
  return (
    <footer className="mt-12 sm:mt-16">

      {/* Newsletter Bar */}
      <div className="bg-blue-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold">Receba as melhores ofertas!</h3>
              <p className="text-blue-200 text-sm mt-1">
                Inscreva-se e receba promoções exclusivas no seu email
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md"
            >
              <input
                type="email"
                placeholder="O seu endereço de email"
                className="flex-1 px-4 py-3 text-sm rounded-l-md text-gray-900 focus:outline-none placeholder-gray-400 bg-white"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-3 rounded-r-md transition-colors text-sm whitespace-nowrap"
              >
                Inscrever
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">

            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
              <img
                src={sinkeraLogo}
                alt="Sinkera"
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                A sua loja de referência para tecnologia em Angola. Produtos originais com garantia oficial e os melhores preços do mercado.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Youtube, label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Empresa
              </h4>
              <ul className="space-y-2">
                {["Sobre Nós", "Blog & Notícias", "Trabalhe Connosco", "Parceiros", "Imprensa"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Categorias
              </h4>
              <ul className="space-y-2">
                {["Smartphones", "Laptops", "TV & Áudio", "Câmeras", "Gaming", "Smartwatch", "Acessórios"].map((category) => (
                  <li key={category}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Apoio ao Cliente
              </h4>
              <ul className="space-y-2">
                {["FAQ", "Como Comprar", "Rastrear Pedido", "Trocas e Devoluções", "Política de Privacidade", "Termos de Uso"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Payments */}
            <div className="space-y-5">
              <div>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                  Contacto
                </h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">Luanda, Angola</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">+244 900 000 000</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">suporte@sinkera.ao</span>
                  </li>
                </ul>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">
                  Pagamento
                </h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white rounded px-2 py-1">
                    <img src={paymentMulticaixa} alt="Multicaixa" className="h-5 w-auto" />
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <img src={paymentVisaMastercard} alt="Visa/Mastercard" className="h-5 w-auto" />
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <img src={paymentBankTransfer} alt="Transferência" className="h-5 w-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <p>© 2025 Sinkera. Todos os direitos reservados.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">🔒</span>
                  Pagamento Seguro
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-400">✓</span>
                  Garantia Oficial
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-orange-400">🚚</span>
                  Entrega Rápida
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
