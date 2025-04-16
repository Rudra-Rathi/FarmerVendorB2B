import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  const footerLinks = [
    { href: "/about", label: t('footer.about') },
    { href: "/help", label: t('footer.helpCenter') },
    { href: "/privacy", label: t('footer.privacy') },
    { href: "/terms", label: t('footer.terms') },
    { href: "/contact", label: t('footer.contact') },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-6 w-6" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="h-6 w-6" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="h-6 w-6" />, href: "#", label: "Twitter" },
    { icon: <Mail className="h-6 w-6" />, href: "#", label: "WhatsApp" },
  ];

  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {footerLinks.map((link, index) => (
            <div key={index} className="px-5 py-2">
              <Link href={link.href}>
                <a className="text-base text-gray-500 hover:text-gray-900">
                  {link.label}
                </a>
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              className="text-gray-400 hover:text-gray-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{social.label}</span>
              {social.icon}
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} {t('general.siteTitle')}. {t('footer.allRightsReserved')}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
