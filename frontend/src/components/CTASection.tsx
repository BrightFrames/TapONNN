import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="bg-gradient-to-br from-hero-foreground via-gray-900 to-feature py-24 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-card/10 rounded-pill px-4 py-2 text-sm text-card/80 border border-card/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Join millions of creators</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-card leading-tight">
          Ready to start
          <br />
          <span className="text-primary italic">building your hub?</span>
        </h2>

        <p className="text-lg text-card/70 max-w-xl mx-auto">
          Get started in seconds. No credit card required. Create your free tapvisit
          today and start connecting your audience to everything you share.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="default" size="xl" className="group">
            Create your free tapvisit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="ghost" size="xl" className="text-card/80 hover:text-card hover:bg-card/10">
            View demo profiles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
