"use client";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
} from "lucide-react"; 
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscriptions";

const menuItems = [{
  title: "Main",
  items: [
    {
      title: "Workflows",
      icon: FolderOpenIcon,
      url: "/workflows"
    },
    {
      title: "Credentials",
      icon: KeyIcon,
      url: "/credentials"
    },
    {
      title: "Executions",
      icon: HistoryIcon,
      url: "/executions"
    }
  ]
}];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router=useRouter();
  const {hasActiveSubscripition,isLoading}=useHasActiveSubscription();
  // Helper function to determine active state
  const isActive = (url: string) => {
    if (url === '/') return pathname === '/';
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href='/workflows' prefetch>
              <img 
                src="/logos/logo.svg" 
                alt="SyncEngine" 
                width={30}
                height={30}
                className="inline-block"
              />
              <span className="font-semibold text-sm">SyncEngine</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      asChild
                      className="gap-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {!hasActiveSubscripition&&!isLoading&&(
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Upgrade to Pro" className="gap-x-4 h-10 px-4" onClick={()=>{
              authClient.checkout({slug:"syncEngine-Pro"})

            }}>
              <StarIcon className="h-4 w-4" />
              <span>Upgrade to Pro</span>

            </SidebarMenuButton>
          </SidebarMenuItem>)}
        </SidebarMenu> <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Billing Portal" className="gap-x-4 h-10 px-4" onClick={()=>{
              authClient.customer.portal();

            }}>
              <CreditCardIcon className="h-4 w-4" />
              <span>Billing Portal</span>

            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" className="gap-x-4 h-10 px-4" onClick={()=>{
                authClient.signOut({
                  fetchOptions:{
                    onSuccess:()=>{
                      router.push("/login");
                    }
                  }
                })
            }}>
              <LogOutIcon className="h-4 w-4" />
              <span>Sign out</span>

            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};