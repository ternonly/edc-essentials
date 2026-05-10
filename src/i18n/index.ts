import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ar: { translation: ar },
        zh: { translation: zh },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "ar", "zh"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
    });
}

if (typeof document !== "undefined") {
  const apply = (lng: string) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };
  apply(i18n.language || "en");
  i18n.on("languageChanged", apply);
}

export default i18n;
