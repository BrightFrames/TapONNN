import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-[1.5px] border-transparent data-[state=unchecked]:bg-[#E9E9EB] data-[state=unchecked]:border-[#D1D1D6] data-[state=checked]:bg-[#34C759] data-[state=checked]:border-[#34C759] dark:data-[state=unchecked]:bg-[#39393D] dark:data-[state=unchecked]:border-[#48484A] active:scale-[0.98]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] ring-0 transition-transform data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[1px] duration-200"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
