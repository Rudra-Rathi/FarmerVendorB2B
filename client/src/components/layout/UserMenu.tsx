import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const UserMenu = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Get user data from localStorage (in a real app, this would come from a global state)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = userData.fullName
    ? userData.fullName.split(" ").map((n: string) => n[0]).join("")
    : "U";

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", undefined);
      localStorage.removeItem("user");
      toast({
        title: t('auth.logoutSuccess'),
        description: t('auth.logoutSuccessMessage'),
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t('auth.logoutError'),
        description: t('auth.logoutErrorMessage'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="ml-4 relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-sm focus:outline-none"
          >
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium text-gray-700">
              {userData.fullName}
            </span>
            <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Link href="/profile">
              <div className="w-full cursor-pointer">{t('user.profile')}</div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings">
              <div className="w-full cursor-pointer">{t('user.settings')}</div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            {t('user.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
