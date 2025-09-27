"use client"

import type * as React from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { SidebarUser } from "./sidebar-user"

export function SidebarComponent({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
}) {
    const {state} = useSidebar()
    

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {state === "collapsed" ? (<SidebarTrigger className="" />) : (
                <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/blank-logo.png"
                    alt="Demo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-zinc-100">Demo Space</span>
                  <span className="text-xs text-zinc-400">WebApp</span>
                </div>
              </Link>)}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-auto">
      </SidebarContent>

      <SidebarFooter className="">
        <SidebarUser onLogout={() => {}} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
