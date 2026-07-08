import { FeaturedSection } from '../../components/catalog/FeaturedSection';

const WHATSAPP_URL = 'https://wa.me/5517991660410';

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-6 text-5xl">📦</div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Soluções em Embalagens Para o Seu Negócio Ir Mais Longe
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
            Distribuidora de embalagens em São José do Rio Preto/SP. Qualidade garantida,
            entrega rápida e preços competitivos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#destaques"
              className="rounded-md bg-secondary px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              Ver Produtos
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-green-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-600"
            >
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold text-primary">
            Por que escolher a CentralMax?
          </h2>
          <p className="mb-10 text-center text-sm text-neutral-600">
            Comprometidos com a qualidade e agilidade que o seu negócio merece
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <BenefitCard icon="📦" title="Variedade" description="Amplo catálogo de embalagens para todo tipo de negócio" />
            <BenefitCard icon="✅" title="Qualidade" description="Produtos selecionados de fornecedores homologados" />
            <BenefitCard icon="🚚" title="Agilidade" description="Atendimento rápido e entrega eficiente em São José do Rio Preto e região" />
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section id="destaques" className="bg-neutral-100 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold text-primary">Produtos em Destaque</h2>
          <p className="mb-8 text-center text-sm text-neutral-600">
            Clique em qualquer produto para ver detalhes e adicionar ao orçamento
          </p>
          <FeaturedSection />
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pronto para fazer seu pedido?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            Entre em contato pelo WhatsApp e receba um orçamento personalizado
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-green-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-600"
          >
            <WhatsAppIcon />
            Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-neutral-300 bg-white p-6 text-center shadow-sm">
      <span className="mb-3 text-4xl">{icon}</span>
      <h3 className="mb-2 text-base font-bold text-primary">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}
