import * as React from "react"

import { cn } from "@/lib/utils"

function NavigationMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="navigation-menu"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  )
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navigation-menu-list"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navigation-menu-item"
      className={cn("min-w-0", className)}
      {...props}
    />
  )
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="navigation-menu-link"
      className={cn(
        "block rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList }
