import React, { useState, useRef, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface ColorSelectorProps {
    color: string;
    onChange: (color: string) => void;
    onClose?: () => void;
}

const ColorSelector = ({ color, onChange, onClose }: ColorSelectorProps) => {
    // Utility for color math
    const hsvToHex = (h: number, s: number, v: number) => {
        h /= 360; s /= 100; v /= 100;
        let r=0, g=0, b=0;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        const f2h = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
        return `#${f2h(r)}${f2h(g)}${f2h(b)}`;
    };

    const isActuallyGradient = typeof color === 'string' && (color.includes('gradient') || color.includes('linear'));
    const [isGradient, setIsGradient] = useState(isActuallyGradient);
    const [hexValue, setHexValue] = useState(isActuallyGradient ? '#000000' : (color || '#000000'));
    const [hue, setHue] = useState(0);
    const [sat, setSat] = useState(100);
    const [val, setVal] = useState(100);
    
    const pickingAreaRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Sync internal state with prop changes
    useEffect(() => {
        const isGrad = typeof color === 'string' && (color.includes('gradient') || color.includes('linear'));
        setIsGradient(isGrad);
        if (!isGrad && color) {
            setHexValue(color);
        }
    }, [color]);

    const updateColor = (s: number, v: number, h: number) => {
        const newHex = hsvToHex(h, s, v);
        setHexValue(newHex);
        onChange(newHex);
    };

    const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
        if (!isDragging.current || !pickingAreaRef.current) return;
        const rect = pickingAreaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
        setSat(x);
        setVal(y);
        updateColor(x, y, hue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        handleMouseMove(e);
        const onMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHue = parseInt(e.target.value);
        setHue(newHue);
        updateColor(sat, val, newHue);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
        // Update parent immediately if it's a valid hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(newHex) || newHex === 'transparent') {
            onChange(newHex);
        }
    };

    const handleGradientToggle = (checked: boolean) => {
        setIsGradient(checked);
        if (checked) {
            const grad = `linear-gradient(135deg, ${hexValue}, #000000)`;
            onChange(grad);
        } else {
            onChange(hexValue);
        }
    };

    const handleAdd = () => {
        if (isGradient) {
            const grad = `linear-gradient(135deg, ${hexValue}, #000000)`;
            onChange(grad);
        } else {
            onChange(hexValue);
        }
        if (onClose) onClose();
    };

    return (
        <div className="w-80 bg-[#111111] border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-white z-50">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold tracking-tight">Gradient Mode</Label>
                    <Switch 
                        checked={isGradient} 
                        onCheckedChange={handleGradientToggle}
                        className="data-[state=checked]:bg-white"
                    />
                </div>

                {/* Color Display Area (HSB Map) */}
                <div 
                    ref={pickingAreaRef}
                    className="relative aspect-square w-full rounded-2xl overflow-hidden cursor-crosshair border border-zinc-800"
                    onMouseDown={handleMouseDown}
                    style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    
                    {/* Selector Circle */}
                    <div 
                        className="absolute w-5 h-5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow-lg pointer-events-none"
                        style={{ 
                            left: `${sat}%`, 
                            bottom: `${val}%` 
                        }} 
                    />
                </div>

                {/* Real Hue Slider */}
                <div className="space-y-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={hue} 
                        onChange={handleHueChange}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-[#ff0000] via-[#ffff00] via-[#00ff00] via-[#00ffff] via-[#0000ff] via-[#ff00ff] to-[#ff0000]"
                        style={{ WebkitAppearance: 'none' }}
                    />
                </div>

                <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                        <Input 
                            value={hexValue}
                            onChange={handleHexInputChange}
                            className="bg-[#1A1A1A] border-zinc-800 text-white text-sm h-12 rounded-2xl pl-4 pr-12 font-mono"
                        />
                        <div 
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-zinc-700 shadow-sm"
                            style={{ backgroundColor: hexValue }}
                        />
                    </div>
                    <Button 
                        variant="ghost" 
                        className="bg-[#1A1A1A] hover:bg-[#222222] border border-zinc-800 text-white text-xs h-12 rounded-2xl px-4"
                        onClick={() => { setHexValue('transparent'); onChange('transparent'); }}
                    >
                        No color
                    </Button>
                </div>

                <Button 
                    className="w-full bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 font-bold text-base transition-all active:scale-[0.98] shadow-lg"
                    onClick={handleAdd}
                >
                    Add
                </Button>
            </div>
        </div>
    );
};

export default ColorSelector;
