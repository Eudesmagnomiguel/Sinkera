import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressBook, type Address } from '@/components/AddressBook';
import {
  Loader2, ChevronRight, MapPin, CreditCard, Banknote,
  Smartphone, CheckCircle2, ShieldCheck, Truck, Package,
  ArrowLeft, Lock, BookMarked, PenLine, FileText, Receipt,
  UploadCloud, X, ImageIcon,
} from 'lucide-react';
import { printProformaInvoice } from '@/lib/invoice';

const PROVINCES = [
  'Luanda','Benguela','Huambo','Bié','Moxico','Huíla','Namibe','Cunene',
  'Cuando Cubango','Lunda Norte','Lunda Sul','Malanje','Uíge','Zaire',
  'Cabinda','Cuanza Norte','Cuanza Sul','Bengo',
];

const PAYMENT_METHODS = [
  {
    id: 'multicaixa',
    label: 'Multicaixa Express',
    desc: 'Pagamento via referência Multicaixa',
    icon: Smartphone,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
  },
  {
    id: 'bank_transfer',
    label: 'Transferência Bancária',
    desc: 'BAI · BFA · BIC · BPC',
    icon: CreditCard,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    id: 'cash_on_delivery',
    label: 'Pagamento na Entrega',
    desc: 'Pague quando receber o produto',
    icon: Banknote,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
];

const STEPS = ['Entrega', 'Pagamento', 'Confirmação'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cartItems, total: cartTotal, clearCart: clearCartFn, loading: cLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // address book
  const [addrMode, setAddrMode] = useState<'saved' | 'new'>('saved');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [saveNewAddr, setSaveNewAddr] = useState(false);

  const [delivery, setDelivery] = useState({
    fullName: '', phone: '', address: '', city: '', province: '', notes: '',
  });
  const [billing, setBilling] = useState({ nif: '', companyName: '', invoiceEmail: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const fmtKz = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (authLoading || cLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) { navigate('/auth'); return null; }
  if (cartItems.length === 0 && !orderId) { navigate('/carrinho'); return null; }

  const validateDelivery = () => {
    return delivery.fullName.trim() && delivery.phone.trim() &&
      delivery.address.trim() && delivery.city.trim() && delivery.province;
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPaymentProofFile(file);
    if (file && file.type.startsWith('image/')) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const snapshotTotal = cartTotal;
    try {
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: snapshotTotal,
          shipping_address: {
            fullName: delivery.fullName,
            phone: delivery.phone,
            address: delivery.address,
            city: delivery.city,
            province: delivery.province,
            notes: delivery.notes,
          },
          payment_method: paymentMethod,
          status: 'pending',
        })
        .select()
        .single();

      if (oErr) throw oErr;

      const { error: iErr } = await supabase.from('order_items').insert(
        cartItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price,
        }))
      );
      if (iErr) throw iErr;

      // Upload comprovativo de pagamento
      if (paymentProofFile) {
        const ext = paymentProofFile.name.split('.').pop();
        const { error: upErr } = await supabase.storage
          .from('payment-proofs')
          .upload(`${user.id}/${order.id}.${ext}`, paymentProofFile, { upsert: true });
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(`${user.id}/${order.id}.${ext}`);
          await supabase.from('orders').update({ payment_proof_url: publicUrl }).eq('id', order.id);
        }
      }

      await clearCartFn();
      setOrderTotal(snapshotTotal);
      setOrderId(order.id);
      setStep(2);
    } catch (err: any) {
      toast({ title: 'Erro ao processar pedido', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 2 && orderId) {
    const shortId = orderId.split('-')[0].toUpperCase();
    const method = PAYMENT_METHODS.find(m => m.id === paymentMethod)!;
    return (
      <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 flex items-center justify-center px-4 py-16 mt-16">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground mb-2">Pedido Confirmado!</h1>
              <p className="text-muted-foreground">Obrigado pela sua compra. O seu pedido foi registado com sucesso.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nº do Pedido</span>
                <span className="font-black text-foreground font-mono">#{shortId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Pago</span>
                <span className="font-bold text-foreground">{fmtKz(orderTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pagamento</span>
                <span className="font-semibold text-foreground">{method.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega para</span>
                <span className="font-semibold text-foreground">{delivery.province}, {delivery.city}</span>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-300 text-left">
              <p className="font-semibold mb-1">Próximos passos</p>
              <ul className="space-y-0.5 text-amber-700 dark:text-amber-400 text-xs">
                <li>• Receberá confirmação por email em breve</li>
                <li>• A equipa irá contactá-lo para confirmar a entrega</li>
                <li>• Prazo estimado: 1–3 dias úteis em Luanda</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/pedidos')} variant="vibrant" className="w-full gap-2">
                <Package className="w-4 h-4" /> Ver os Meus Pedidos
              </Button>
              <Button onClick={() => navigate('/produtos')} variant="outline" className="w-full gap-2">
                Continuar a Comprar
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1 container mx-auto px-4 py-6 mt-20 max-w-5xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/carrinho" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Carrinho
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Finalizar Compra</span>
        </nav>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-emerald-500 text-white'
                  : i === step ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-semibold hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full ${i < step ? 'bg-emerald-400' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Left: form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Step 0 — Delivery */}
            {step === 0 && (
              <div className="space-y-4">

                {/* Mode toggle */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Endereço de Entrega</h2>
                      <p className="text-xs text-muted-foreground">Escolha ou adicione um endereço</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddrMode('saved')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        addrMode === 'saved'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <BookMarked className="w-4 h-4" /> Endereços guardados
                    </button>
                    <button
                      onClick={() => setAddrMode('new')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        addrMode === 'new'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <PenLine className="w-4 h-4" /> Novo endereço
                    </button>
                  </div>

                  {/* Saved addresses */}
                  {addrMode === 'saved' && (
                    <AddressBook
                      selectable
                      selectedId={selectedAddrId ?? undefined}
                      onSelect={(addr) => {
                        setSelectedAddrId(addr.id);
                        setDelivery({
                          fullName: addr.full_name,
                          phone: addr.phone,
                          address: addr.address,
                          city: addr.city,
                          province: addr.province,
                          notes: addr.notes || '',
                        });
                      }}
                      onAddressesChange={(list) => {
                        setSavedAddresses(list);
                        // Auto-select default if nothing selected
                        if (!selectedAddrId) {
                          const def = list.find(a => a.is_default) ?? list[0];
                          if (def) {
                            setSelectedAddrId(def.id);
                            setDelivery({
                              fullName: def.full_name,
                              phone: def.phone,
                              address: def.address,
                              city: def.city,
                              province: def.province,
                              notes: def.notes || '',
                            });
                          }
                        }
                        if (list.length === 0) setAddrMode('new');
                      }}
                    />
                  )}

                  {/* New address form */}
                  {addrMode === 'new' && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Nome Completo *</Label>
                          <Input value={delivery.fullName} onChange={e => setDelivery(d => ({ ...d, fullName: e.target.value }))} placeholder="Seu nome completo" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Telefone *</Label>
                          <Input value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))} placeholder="+244 9xx xxx xxx" className="rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Endereço Completo *</Label>
                        <Input value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} placeholder="Rua, número, bairro" className="rounded-xl" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Cidade *</Label>
                          <Input value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))} placeholder="Ex: Luanda" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Província *</Label>
                          <select value={delivery.province} onChange={e => setDelivery(d => ({ ...d, province: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Selecionar província...</option>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Referência / Instruções (opcional)</Label>
                        <Input value={delivery.notes} onChange={e => setDelivery(d => ({ ...d, notes: e.target.value }))} placeholder="Ex: Portão azul, ligar antes..." className="rounded-xl" />
                      </div>
                      {/* Save for future */}
                      <button
                        type="button"
                        onClick={() => setSaveNewAddr(v => !v)}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${saveNewAddr ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${saveNewAddr ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        Guardar este endereço na minha conta
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full h-11 rounded-xl gap-2 font-bold"
                  variant="vibrant"
                  disabled={addrMode === 'saved' ? !selectedAddrId : !validateDelivery()}
                  onClick={async () => {
                    // Optionally save new address
                    if (addrMode === 'new' && saveNewAddr && user) {
                      await (supabase as any).from('delivery_addresses').insert([{
                        user_id: user.id,
                        label: 'Casa',
                        full_name: delivery.fullName,
                        phone: delivery.phone,
                        address: delivery.address,
                        city: delivery.city,
                        province: delivery.province,
                        notes: delivery.notes || null,
                        is_default: savedAddresses.length === 0,
                      }]);
                    }
                    setStep(1);
                  }}
                >
                  Continuar para Pagamento <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 1 — Payment */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Método de Pagamento</h2>
                      <p className="text-xs text-muted-foreground">Escolha como prefere pagar</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon, color, bg }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-border hover:border-border/80 hover:bg-muted/40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === id ? 'border-primary' : 'border-muted-foreground/40'
                        }`}>
                          {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Security note */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Os seus dados estão protegidos por encriptação SSL de 256 bits.</span>
                  </div>
                </div>

                {/* Delivery summary */}
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Endereço de Entrega
                    </h3>
                    <button onClick={() => setStep(0)} className="text-xs text-primary font-semibold hover:text-primary/80">
                      Editar
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-semibold text-foreground">{delivery.fullName}</p>
                    <p>{delivery.address}</p>
                    <p>{delivery.city}, {delivery.province}</p>
                    <p>{delivery.phone}</p>
                  </div>
                </div>

                {/* Billing / Fiscal data */}
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-muted-foreground" /> Dados de Facturação
                    </h3>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Opcional</span>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Preencha para registar o NIF ou nome de empresa na factura proforma.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">NIF</Label>
                      <Input
                        value={billing.nif}
                        onChange={e => setBilling(b => ({ ...b, nif: e.target.value }))}
                        placeholder="Ex: 5000000000"
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome / Empresa para Factura</Label>
                      <Input
                        value={billing.companyName}
                        onChange={e => setBilling(b => ({ ...b, companyName: e.target.value }))}
                        placeholder="Nome ou razão social"
                        className="rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email para Factura</Label>
                    <Input
                      type="email"
                      value={billing.invoiceEmail}
                      onChange={e => setBilling(b => ({ ...b, invoiceEmail: e.target.value }))}
                      placeholder={user?.email || 'email@exemplo.com'}
                      className="rounded-xl text-sm"
                    />
                  </div>
                  {/* Comprovativo de pagamento */}
                  {paymentMethod !== 'cash_on_delivery' && (
                    <div className="space-y-2 pt-1">
                      <Label className="text-xs flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" /> Comprovativo de Pagamento
                        <span className="text-muted-foreground font-normal">(opcional)</span>
                      </Label>
                      <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        paymentProofFile ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/40'
                      }`}>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleProofChange}
                        />
                        {proofPreview ? (
                          <img src={proofPreview} alt="preview" className="h-20 object-contain rounded-lg" />
                        ) : paymentProofFile ? (
                          <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <ImageIcon className="w-4 h-4" />
                            {paymentProofFile.name}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-muted-foreground space-y-1">
                            <UploadCloud className="w-6 h-6 mx-auto text-muted-foreground/60" />
                            <span>Clique para carregar imagem ou PDF</span>
                          </div>
                        )}
                      </label>
                      {paymentProofFile && (
                        <button
                          type="button"
                          onClick={() => { setPaymentProofFile(null); setProofPreview(null); }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" /> Remover ficheiro
                        </button>
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl text-sm"
                    onClick={() => printProformaInvoice({
                      items: cartItems.map(i => ({
                        name: i.product.name,
                        price: i.product.price,
                        quantity: i.quantity,
                      })),
                      subtotal: cartTotal,
                      discount: 0,
                      customerName: billing.companyName || delivery.fullName,
                      customerEmail: billing.invoiceEmail || user?.email,
                      nif: billing.nif || undefined,
                      companyName: billing.companyName || undefined,
                    })}
                  >
                    <FileText className="w-4 h-4" />
                    Gerar Factura Proforma
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="gap-1.5 rounded-xl">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-xl gap-2 font-bold"
                    variant="vibrant"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Confirmar Pedido — {fmtKz(cartTotal)}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">

              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-black text-foreground">Resumo</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{itemCount} {itemCount === 1 ? 'artigo' : 'artigos'}</p>
              </div>

              {/* Items */}
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 px-5 py-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-foreground flex-shrink-0">
                      {fmtKz(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-5 py-4 space-y-2.5 border-t border-border bg-muted/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{fmtKz(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" /> Envio
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Grátis</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-border pt-2.5">
                  <span className="font-black text-foreground">Total</span>
                  <span className="font-black text-foreground text-lg">{fmtKz(cartTotal)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="px-5 py-3 border-t border-border flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Compra Segura</span>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Envio Grátis</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-violet-500" /> Garantia</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
