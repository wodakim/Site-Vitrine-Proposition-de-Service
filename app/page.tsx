import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <h1 className="text-6xl font-serif text-foreground animate-pulse">LogoLoom</h1>
      <p className="text-xl font-sans text-center max-w-2xl">
        Tisser votre identité numérique avec une élégance mystérieuse.
      </p>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="p-6 bg-surface rounded-lg border border-accent-primary/20 hover:border-accent-primary transition-colors group">
          <h2 className={cn("text-2xl font-serif mb-4 group-hover:text-accent-primary transition-colors")}>
            Web Design
          </h2>
          <p className="font-sans text-sm text-gray-400">
            Support image + vidéo pour une expérience immersive.
          </p>
        </div>

        <div className="p-6 bg-surface rounded-lg border border-accent-secondary/20 hover:border-accent-secondary transition-colors group">
          <h2 className="text-2xl font-serif mb-4 group-hover:text-accent-secondary transition-colors">
            Retro Mode
          </h2>
          <p className="font-mono text-xs text-accent-secondary animate-blink">
            _INSERT COIN
          </p>
        </div>
      </div>

      <div className="mt-12 p-4 border border-dashed border-gray-700 rounded w-full max-w-md">
        <p className="retro-text text-sm mb-2">System Status:</p>
        <div className="h-2 w-full bg-gray-800 rounded overflow-hidden">
          <div className="h-full bg-accent-primary w-[60%] animate-pulse"></div>
        </div>
        <p className="font-mono text-xs text-gray-500 mt-2 text-right">v1.0.0 [BETA]</p>
      </div>

      <button className="px-8 py-3 bg-foreground text-background font-sans font-bold hover:bg-accent-primary hover:text-background transition-colors hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-none">
        START PROJECT
      </button>
    </main>
  );
}
