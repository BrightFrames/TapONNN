import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function BookingCalendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3 w-full", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-between pt-1 relative items-center px-1",
                caption_label: "text-lg font-semibold",
                nav: "flex items-center space-x-1",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell:
                    "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] text-blue-500",
                row: "flex w-full mt-2",
                cell: "h-20 w-full text-center text-sm p-0 m-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border-t border-r border-gray-100 last:border-r-0",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-full w-full p-0 font-normal aria-selected:opacity-100 items-start justify-end pr-2 pt-2 hover:bg-gray-50"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
            }}
            formatters={{
                formatWeekdayName: (day) => {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return days[day.getDay()];
                }
            }}
            {...props}
        />
    );
}

export { BookingCalendar };
