import React, { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { Server, Cpu, ShieldCheck, Gauge, Rocket, CreditCard, HeadphonesIcon as Headphones, CheckCircle2, Star, Globe, Zap, ChevronRight, Info } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const Section = ({ id, eyebrow, title, subtitle, children }) => (
  <section id={id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="mb-10 text-center">
      {eyebrow && <div className="mb-3"><span className="badge"><Zap className="size-3" /> {eyebrow}</span></div>}
      {title && <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>}
      {subtitle && <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
    {children}
  </section>
)

const Card = ({ children, className='' }) => <div className={`card ${className}`}>{children}</div>

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-4">
    <div className="mt-1"><div className="size-10 rounded-2xl border flex items-center justify-center shadow-sm"><Icon className="size-5" /></div></div>
    <div><h4 className="font-semibold">{title}</h4><p className="text-sm text-gray-600">{desc}</p></div>
  </div>
)

function Configurator(){
  const [players, setPlayers] = useState(50)
  const [ram, setRam] = useState(8)
  const [storage, setStorage] = useState(40)
  const [support, setSupport] = useState('standard')
  const [region, setRegion] = useState('london')

  // Pricing rules (must match backend)
  const rules = {
    base: 150,                 // £1.50 in pence
    perPlayer: 3,              // £0.03 per player
    perRamGb: 100,             // £1.00 per GB
    perStorageGb: 2,           // £0.02 per GB
    support: { standard: 0, priority: 300, premium: 700 },
    regionFactor: { london: 1.0, frankfurt: 1.0, dallas: 1.0 }
  }

  const pricePence = useMemo(() => {
    const p = Math.round(
      rules.base +
      players * rules.perPlayer +
      ram * rules.perRamGb +
      storage * rules.perStorageGb +
      rules.support[support]
    ) * rules.regionFactor[region]
    return Math.round(p)
  }, [players, ram, storage, support, region])

  const priceDisplay = useMemo(() => `£${(pricePence/100).toFixed(2)}`, [pricePence])

  const createCheckout = async () => {
    const stripe = await stripePromise
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players, ram, storage, support, region })
    })
    const data = await res.json()
    if(!res.ok){ alert(data.error || 'Failed to create checkout'); return }
    const { error } = await stripe.redirectToCheckout({ sessionId: data.id })
    if (error) alert(error.message)
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2">Configure your server</h3>
      <p className="text-sm text-gray-600 mb-4">Choose players, RAM, storage, and support. Pricing updates live.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Players: {players}</label>
          <input type="range" min="10" max="500" value={players} onChange={e=>setPlayers(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-medium">RAM (GB): {ram}</label>
          <input type="range" min="1" max="64" value={ram} onChange={e=>setRam(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-medium">Storage (GB): {storage}</label>
          <input type="range" min="10" max="200" value={storage} onChange={e=>setStorage(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-medium">Support</label>
          <select value={support} onChange={e=>setSupport(e.target.value)} className="w-full rounded-xl border px-3 py-2">
            <option value="standard">Standard (free)</option>
            <option value="priority">Priority (+£3)</option>
            <option value="premium">Premium (+£7)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Region</label>
          <select value={region} onChange={e=>setRegion(e.target.value)} className="w-full rounded-xl border px-3 py-2">
            <option value="london">London (GB)</option>
            <option value="frankfurt">Frankfurt (DE)</option>
            <option value="dallas">Dallas (US)</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-3xl font-extrabold">{priceDisplay}</p>
        </div>
        <div className="flex gap-2">
          <a href="#faq" className="btn btn-ghost"><Info className="size-4" /> Details</a>
          <button onClick={createCheckout} className="btn btn-primary"><CreditCard className="size-4" /> Pay by card</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Payments are processed by Stripe. Card only.</p>
    </Card>
  )
}

const games = [
  { name: 'FiveM', spec: 'NVMe • DDoS • 24/7', icon: <Server className='size-5'/> },
  { name: 'Minecraft', spec: 'Java/Bedrock • 1-100 slots', icon: <Cpu className='size-5'/> },
  { name: 'Rust', spec: 'High TPS • Mod support', icon: <Cpu className='size-5'/> },
  { name: 'ARK: SE', spec: 'Maps & Mods', icon: <ShieldCheck className='size-5'/> },
  { name: 'Valheim', spec: '1-click mods', icon: <Gauge className='size-5'/> },
  { name: "Garry's Mod", spec: 'FastDL ready', icon: <Server className='size-5'/> },
]

export default function App(){
  return (
    <div className="min-h-screen text-gray-900">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl" style={{background:'var(--brand-blue)', color:'white', display:'grid', placeItems:'center'}}>
              <Zap className="size-4" />
            </div>
            <span className="font-extrabold tracking-tight">British Hosting</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#games" className="hover:opacity-80">Games</a>
            <a href="#pricing" className="hover:opacity-80">Pricing</a>
            <a href="#features" className="hover:opacity-80">Features</a>
            <a href="#faq" className="hover:opacity-80">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#status" className="btn btn-ghost"><Info className="size-4"/> Status</a>
            <a href="#pricing" className="btn btn-primary"><Rocket className="size-4"/> Get started</a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 size-72 rounded-full" style={{background:'rgba(10,36,114,0.08)', filter:'blur(40px)'}} />
          <div className="absolute -bottom-24 -right-24 size-72 rounded-full" style={{background:'rgba(217,4,41,0.15)', filter:'blur(40px)'}} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:.5}} className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="badge">NVMe & DDoS included</span>
              <span className="badge">British Red & Blue Theme</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Spin up game servers in seconds —
              <span className="block">pay only for what you pick.</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Fully configurable pricing with card-only checkout powered by Stripe.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a href="#pricing" className="btn btn-primary"><Rocket className="size-4"/> Launch now</a>
              <a href="#games" className="btn btn-outline"><ChevronRight className="size-4"/> Browse games</a>
            </div>
          </motion.div>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg. setup time', value: '20s' },
              { label: 'Uptime (90d)', value: '99.9%' },
              { label: 'Tickets < 1h', value: '92%' },
            ].map(k => (
              <Card key={k.label} className="p-6">
                <p className="text-sm text-gray-600">{k.label}</p>
                <p className="text-2xl font-bold">{k.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Section id="games" eyebrow="Supported games" title="Pick a game, click deploy" subtitle="One-click modpacks, version switching, and SFTP access come standard.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(g => (
            <Card key={g.name} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-gray-600">{g.spec}</p>
              </div>
              <div className="opacity-70">{g.icon}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Configurator" title="Build your own plan" subtitle="Players, RAM, storage, support — the price updates instantly.">
        <Configurator />
      </Section>

      <Section id="features" eyebrow="Why choose us" title="Built for performance and peace of mind">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Feature icon={Cpu} title="Latest-gen CPUs" desc="High clock speeds for top TPS and tick-rate stability." />
            <Feature icon={ShieldCheck} title="Always-on DDoS" desc="Automatic L3/L4 mitigation with global anycast." />
            <Feature icon={Gauge} title="NVMe storage" desc="Ridiculously fast I/O for quicker world loads and restarts." />
            <Feature icon={Headphones} title="Human support" desc="UK-based staff with real game-server experience." />
          </div>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl border grid place-items-center" style={{color:'var(--brand-blue)'}}><Globe className="size-5"/></div>
              <div>
                <h4 className="font-semibold">Global locations</h4>
                <p className="text-sm text-gray-600">
                  London, Frankfurt, Dallas & more. Pick the closest region to your players for the best latency.
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  {['London','Frankfurt','Dallas','Sydney','Singapore','São Paulo'].map(c => (
                    <div key={c} className="text-sm px-3 py-2 rounded-xl border bg-white">{c}</div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            { q: 'How do I enable payments?', a: 'Add your Stripe keys to the .env files (frontend and backend) and deploy the backend.'},
            { q: 'Can I change the price rules?', a: 'Yes. Edit the rules in both the frontend (App.jsx) and backend (server.js) to match.'},
            { q: 'Card payments only?', a: 'Yes, Stripe Checkout is configured with card only.'},
            { q: 'Where do I deploy?', a: 'Frontend: Netlify/Vercel/Pages. Backend: Render/Glitch/Fly/Heroku free tiers.'},
          ].map((item,i) => (
            <Card key={i} className="p-5">
              <p className="font-semibold">{item.q}</p>
              <p className="mt-2 text-gray-600">{item.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      <footer className="border-t py-10 bg-white/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-xl" style={{background:'var(--brand-blue)', color:'white', display:'grid', placeItems:'center'}}><Zap className="size-4"/></div>
                <span className="font-extrabold">British Hosting</span>
              </div>
              <p className="text-gray-600">Configurable game server hosting with a British red & blue theme.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Company</p>
              <ul className="space-y-1 text-gray-600">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#status" className="hover:underline">Status</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Legal</p>
              <ul className="space-y-1 text-gray-600">
                <li><a href="#" className="hover:underline">Terms</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Service Level</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Contact</p>
              <ul className="space-y-1 text-gray-600">
                <li><a href="mailto:hello@yourdomain.tld" className="hover:underline">hello@yourdomain.tld</a></li>
                <li><a href="#" className="hover:underline">Discord</a></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-8">© {new Date().getFullYear()} British Hosting. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
