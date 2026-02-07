import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlitchText } from "@/components/ui/GlitchText";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-background text-foreground space-y-20 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-[128px] -z-10 animate-pulse" />

        <GlitchText text="LogoLoom" size="hero" className="mb-4" />

        <p className="text-xl font-sans text-center max-w-2xl text-gray-400">
          Tisser votre identité numérique avec une élégance mystérieuse.
        </p>

        <div className="flex gap-4 justify-center">
          <Button variant="default" size="lg">
            Start Project
          </Button>
          <Button variant="retro" size="lg">
            _INSERT COIN
          </Button>
        </div>
      </section>

      {/* Components Showcase */}
      <section className="w-full max-w-5xl space-y-12">
        <SectionTitle
          title="Our Services"
          subtitle="System Modules"
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Web Design</CardTitle>
              <CardDescription>Immersive Experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Support image + vidéo pour une expérience utilisateur sans compromis.
                Architecture Next.js 14+ et animations WebGL.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0 h-auto text-accent-primary">Explore module &rarr;</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visual Identity</CardTitle>
              <CardDescription>Brand Engineering</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Création de logos vectoriels et chartes graphiques complètes.
                Approche atomique et scalable.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0 h-auto text-accent-primary">Explore module &rarr;</Button>
            </CardFooter>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>App Webview</CardTitle>
              <CardDescription>Mobile First</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Intégration native via Webview. Performance Core Web Vitals optimale.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0 h-auto text-accent-primary">Explore module &rarr;</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Button Gallery */}
      <section className="w-full max-w-5xl space-y-8">
        <SectionTitle title="Interface Controls" subtitle="UI Kit" align="center" />

        <div className="flex flex-wrap gap-8 justify-center items-center bg-surface/50 p-12 rounded-xl border border-white/5">
          <Button variant="default">Default Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="retro">Retro Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>
    </main>
  );
}
