import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';

export function LandingPage() {
  const { session } = useUserStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground">
            N
          </div>
          <span className="text-xl font-bold tracking-tight">NanoTrade</span>
        </div>
        <nav>
          {session ? (
            <Link to="/dashboard">
              <Button variant="default">Go to Terminal</Button>
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link to="/auth">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button variant="default">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Now in Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            Zero latency. <br />
            <span className="text-muted-foreground">Infinite possibilities.</span>
          </h1>
          <p className="text-xl text-muted-foreground md:text-2xl max-w-[42rem] mx-auto font-medium">
            The professional crypto paper trading terminal designed for speed, precision, and simplicity. Build your edge without risking capital.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            {session ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base">Launch Terminal</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base">Start Trading Now</Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-card border-t border-border/40 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
              ⚡
            </div>
            <h3 className="text-xl font-bold">Real-time Execution</h3>
            <p className="text-muted-foreground leading-relaxed">
              Powered by WebSocket streams and a high-performance in-memory matching engine. Your trades execute the moment you click.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
              📊
            </div>
            <h3 className="text-xl font-bold">Data-first Design</h3>
            <p className="text-muted-foreground leading-relaxed">
              A meticulously crafted interface free of clutter. See your portfolio, orderbook, and charts in one dense, readable view.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
              🔒
            </div>
            <h3 className="text-xl font-bold">Secure by Default</h3>
            <p className="text-muted-foreground leading-relaxed">
              Industry-grade JWT authentication via Supabase ensures your data remains strictly yours. Absolute privacy upon logout.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>© 2026 NanoTrade. A premium paper trading experience.</p>
      </footer>
    </div>
  );
}
