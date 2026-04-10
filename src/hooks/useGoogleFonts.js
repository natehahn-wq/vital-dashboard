// Injects the Cormorant Garant + DM Sans + DM Mono Google Fonts stylesheet once.
import { useEffect } from "react";

export function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById("vf")) return;
    const l = document.createElement("link");
    l.id = "vf"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }, []);
}
