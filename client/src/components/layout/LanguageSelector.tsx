import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { languageOptions } from "@/lib/i18n";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentLanguageName = () => {
    const langCode = i18n.language;
    const language = languageOptions.find(lang => lang.code === langCode);
    return language ? language.name : "English";
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-sm font-medium text-gray-700 focus:outline-none"
          >
            <Globe className="mr-1 h-4 w-4" />
            <span className="hidden md:inline">{getCurrentLanguageName()}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languageOptions.map((language) => (
            <DropdownMenuItem 
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="cursor-pointer"
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
