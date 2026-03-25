import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Extend button with app-specific variants
export { Button };

// Option button for quiz
export const optionButtonClass = cn(
  "w-full text-left justify-start h-auto py-4 px-5 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  "border border-border hover:border-primary/40 transition-all duration-200",
  "active:scale-[0.98] rounded-lg text-sm leading-relaxed"
);

export const optionCorrectClass = cn(
  "w-full text-left justify-start h-auto py-4 px-5",
  "bg-success/15 border-success/50 text-foreground border",
  "rounded-lg text-sm leading-relaxed"
);

export const optionWrongClass = cn(
  "w-full text-left justify-start h-auto py-4 px-5",
  "bg-destructive/15 border-destructive/50 text-foreground border",
  "rounded-lg text-sm leading-relaxed"
);
