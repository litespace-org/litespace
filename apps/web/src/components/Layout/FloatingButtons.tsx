import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import WhatsApp from "@litespace/assets/WhatsAppV2";
import { Web } from "@litespace/utils/routes";

import { LITESPACE_WHATSAPP } from "@/constants/links";
import { router } from "@/lib/routes";

const FloatingButtons: React.FC = () => {
  return (
    <div className="hidden sm:flex sm:fixed left-4 bottom-24 sm:left-6 sm:bottom-6 z-floating-buttons">
      <FloatingWhatsapp />
    </div>
  );
};

export default FloatingButtons;

const FloatingWhatsapp: React.FC = () => {
  const location = useLocation();

  const showFloatingWhatsapp = useMemo(() => {
    const routes: Web[] = [
      Web.Login,
      Web.Lessons,
      Web.Lesson,
      Web.Chat,
      Web.Checkout,
    ];
    return !routes.some((route) => router.match(route, location.pathname));
  }, [location.pathname]);

  if (!showFloatingWhatsapp) return;

  return (
    <Link to={LITESPACE_WHATSAPP} tabIndex={-1} target="_blank">
      <WhatsApp className="w-16 h-16" />
    </Link>
  );
};
