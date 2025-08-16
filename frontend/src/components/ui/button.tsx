import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-[#5482ef] hover:bg-[#4a75d8] dark:hover:bg-[#3d6bc7] hover:shadow-md dark:hover:shadow-[#5482ef]/20 text-white',
        destructive:
          'bg-destructive hover:bg-destructive/90 dark:hover:bg-destructive/80 hover:shadow-md dark:hover:shadow-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background text-gray-900 dark:text-white hover:bg-[#5482ef]/10 hover:text-[#5482ef] hover:border-[#5482ef] hover:shadow-sm dark:bg-input/30 dark:border-input dark:hover:bg-[#5482ef]/20 dark:hover:text-[#5482ef] dark:hover:border-[#5482ef]',
        secondary:
          'bg-[#5482ef]/10 text-[#5482ef] dark:bg-[#5482ef]/20 dark:text-[#5482ef] hover:bg-[#5482ef]/20 dark:hover:bg-[#5482ef]/30 hover:shadow-md dark:hover:shadow-[#5482ef]/20',
        ghost:
          'hover:bg-[#5482ef]/10 hover:text-[#5482ef] hover:shadow-sm dark:hover:bg-[#5482ef]/20 dark:hover:text-[#5482ef] dark:hover:shadow-[#5482ef]/20',
        link: 'text-[#5482ef] underline-offset-4 hover:underline hover:text-[#4a75d8] dark:text-[#5482ef] dark:hover:text-[#4a75d8]',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
