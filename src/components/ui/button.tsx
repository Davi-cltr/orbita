// Adaptado do shadcn/ui (new-york-v4), com as variantes da Órbita
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'roll-host inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-display font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-500 ease-(--ease-orbita) outline-none focus-visible:outline-solid focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-saturno disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-foguete text-vacuo hover:bg-saturno',
        outline: 'border border-poeira/40 text-poeira hover:border-poeira hover:bg-poeira hover:text-vacuo',
        ghost: 'text-poeira hover:bg-poeira/10',
        light: 'bg-poeira text-vacuo hover:bg-saturno',
      },
      size: {
        default: 'h-11 px-5 text-[0.82rem]',
        sm: 'h-9 px-4 text-[0.75rem]',
        lg: 'h-14 px-7 text-[0.95rem]',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
