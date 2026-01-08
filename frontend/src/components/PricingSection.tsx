import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const PricingSection = () => {
    const [activeTab, setActiveTab] = useState<"profile" | "store">("profile");

    const pricingData = {
        profile: [
            {
                title: "Personal",
                price: "₹299/yr",
                description: "Ideal for individuals and professionals sharing a basic digital identity.",
                bgColor: "bg-card text-card-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
            },
            {
                title: "Creator",
                price: "₹699/yr",
                description: "Ideal for creators and freelancers who need more links, content, and enquiries",
                bgColor: "bg-foreground text-background",
                buttonVariant: "default",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
                textColor: "text-background",
                descriptionColor: "text-muted"
            },
            {
                title: "Professional",
                price: "₹2499/yr",
                description: "Ideal for businesses requiring multiple profiles, branding control, and lead management.",
                bgColor: "bg-primary text-primary-foreground",
                buttonVariant: "default",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
            },
        ],
        store: [
            {
                title: "Starter",
                price: "₹999/yr",
                description: "Perfect for small shops starting their digital journey.",
                bgColor: "bg-card text-card-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
            },
            {
                title: "Business",
                price: "₹1999/yr",
                description: "Advanced features for growing businesses with inventory management.",
                bgColor: "bg-foreground text-background",
                buttonVariant: "default",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
                textColor: "text-background",
                descriptionColor: "text-muted"
            },
            {
                title: "Enterprise",
                price: "₹4999/yr",
                description: "Full suite of tools for large scale operations and custom integrations.",
                bgColor: "bg-primary text-primary-foreground",
                buttonVariant: "default",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
            },
        ],
    };

    return (
        <section id="pricing" className="py-20 px-4 flex flex-col items-center bg-background">
            <div className="text-center mb-12">
                <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase border border-border rounded-full text-foreground mb-6 inline-block">
                    PRICING & PLANS
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Start for Free.<br />
                    Upgrade From Just ₹1 Per Day.
                </h2>
            </div>

            {/* Tabs */}
            <div className="bg-card border border-border p-1 rounded-full flex gap-1 mb-16 shadow-sm">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${activeTab === "profile"
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    DIGITAL PROFILE
                </button>
                <button
                    onClick={() => setActiveTab("store")}
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${activeTab === "store"
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    DIGITAL STORE
                </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
                {pricingData[activeTab].map((plan, index) => (
                    <div
                        key={index}
                        className={`rounded-3xl p-8 flex flex-col h-full min-h-[450px] transition-transform hover:scale-[1.02] duration-300 shadow-lg ${plan.bgColor}`}
                    >
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                            <div className="text-5xl font-bold mb-8">{plan.price}</div>
                            <p className={`text-lg mb-8 leading-relaxed ${plan.descriptionColor || "text-card-foreground/80"}`}>
                                {plan.description}
                            </p>
                        </div>

                        <button
                            className={`mt-auto w-full group flex items-center justify-between py-4 px-6 rounded-full font-bold transition-all ${plan.buttonBg}`}
                        >
                            <span>Try For Free</span>
                            <div className={`p-1 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${plan.title === "Professional" || plan.title === "Enterprise" ? "bg-black text-primary" : "bg-background text-foreground"}`}>
                                <ArrowRight size={20} />
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PricingSection;
