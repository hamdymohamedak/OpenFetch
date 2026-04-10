import { defineConfig } from "vitepress";

type Lang = "ar" | "es" | "fa" | "fr" | "hi" | "it" | "ja" | "kr" | "ku";

const LANGS: Lang[] = ["ar", "es", "fa", "fr", "hi", "it", "ja", "kr", "ku"];

type NavLabels = {
  home: string;
  gettingStarted: string;
  httpMethods: string;
  frameworks: string;
  configuration: string;
  interceptors: string;
  retryCache: string;
  errorsSecurity: string;
};

const LABELS: Record<Lang, NavLabels> = {
  ar: {
    home: "نظرة عامة",
    gettingStarted: "البدء",
    httpMethods: "طرق HTTP",
    frameworks: "React و Vue",
    configuration: "الإعدادات",
    interceptors: "المعترضات والوسيط",
    retryCache: "إعادة المحاولة والتخزين المؤقت",
    errorsSecurity: "الأخطاء والأمان",
  },
  es: {
    home: "Resumen",
    gettingStarted: "Primeros pasos",
    httpMethods: "Métodos HTTP",
    frameworks: "React y Vue",
    configuration: "Configuración",
    interceptors: "Interceptores y middleware",
    retryCache: "Reintentos y caché",
    errorsSecurity: "Errores y seguridad",
  },
  fa: {
    home: "نمای کلی",
    gettingStarted: "شروع سریع",
    httpMethods: "متدهای HTTP",
    frameworks: "React و Vue",
    configuration: "پیکربندی",
    interceptors: "قطع‌کننده‌ها و میان‌افزار",
    retryCache: "تلاش مجدد و حافظهٔ نهان",
    errorsSecurity: "خطا و امنیت",
  },
  fr: {
    home: "Aperçu",
    gettingStarted: "Démarrage",
    httpMethods: "Méthodes HTTP",
    frameworks: "React et Vue",
    configuration: "Configuration",
    interceptors: "Intercepteurs et middleware",
    retryCache: "Nouvelles tentatives et cache",
    errorsSecurity: "Erreurs et sécurité",
  },
  hi: {
    home: "अवलोकन",
    gettingStarted: "शुरुआत",
    httpMethods: "HTTP विधियाँ",
    frameworks: "React और Vue",
    configuration: "कॉन्फ़िगरेशन",
    interceptors: "इंटरसेप्टर और मिडलवेयर",
    retryCache: "रीट्राई और कैश",
    errorsSecurity: "त्रुटियाँ और सुरक्षा",
  },
  it: {
    home: "Panoramica",
    gettingStarted: "Introduzione",
    httpMethods: "Metodi HTTP",
    frameworks: "React e Vue",
    configuration: "Configurazione",
    interceptors: "Intercettori e middleware",
    retryCache: "Retry e cache",
    errorsSecurity: "Errori e sicurezza",
  },
  ja: {
    home: "概要",
    gettingStarted: "はじめに",
    httpMethods: "HTTP メソッド",
    frameworks: "React と Vue",
    configuration: "設定",
    interceptors: "インターセプターとミドルウェア",
    retryCache: "リトライとキャッシュ",
    errorsSecurity: "エラーとセキュリティ",
  },
  kr: {
    home: "개요",
    gettingStarted: "시작하기",
    httpMethods: "HTTP 메서드",
    frameworks: "React와 Vue",
    configuration: "설정",
    interceptors: "인터셉터와 미들웨어",
    retryCache: "재시도와 캐시",
    errorsSecurity: "오류와 보안",
  },
  ku: {
    home: "Kurtebînî",
    gettingStarted: "Destpêk",
    httpMethods: "Rêbazên HTTP",
    frameworks: "React û Vue",
    configuration: "Veavakirin",
    interceptors: "Interceptors û middleware",
    retryCache: "Retry û cache",
    errorsSecurity: "Çewtî û ewlehî",
  },
};

const ROOT_LABELS: NavLabels = {
  home: "Overview",
  gettingStarted: "Getting started",
  httpMethods: "HTTP methods",
  frameworks: "React & Vue",
  configuration: "Configuration",
  interceptors: "Interceptors & middleware",
  retryCache: "Retry & cache",
  errorsSecurity: "Errors & security",
};

const LANG_HOME_LABEL: Record<Lang, string> = {
  ar: "اللغات",
  es: "Idiomas",
  fa: "زبان‌ها",
  fr: "Langues",
  hi: "भाषाएँ",
  it: "Lingue",
  ja: "言語",
  kr: "언어",
  ku: "Ziman",
};

function sidebarRoot() {
  const L = ROOT_LABELS;
  return [
    {
      text: "openFetch",
      items: [
        { text: "Languages", link: "/languages/" },
        { text: L.home, link: "/" },
        { text: L.gettingStarted, link: "/getting-started" },
        { text: L.httpMethods, link: "/http-methods" },
        { text: L.frameworks, link: "/framework-guides" },
        { text: L.configuration, link: "/configuration" },
        { text: L.interceptors, link: "/interceptors-middleware" },
        { text: L.retryCache, link: "/retry-cache" },
        { text: L.errorsSecurity, link: "/errors-security" },
      ],
    },
  ];
}

function sidebarFor(lang: Lang) {
  const L = LABELS[lang];
  const p = `/${lang}`;
  const extended = lang === "ar";
  const items: { text: string; link: string }[] = [
    { text: LANG_HOME_LABEL[lang], link: "/languages/" },
    { text: L.home, link: `${p}/` },
    { text: L.gettingStarted, link: `${p}/getting-started` },
  ];
  if (extended) {
    items.push(
      { text: L.httpMethods, link: `${p}/http-methods` },
      { text: L.frameworks, link: `${p}/framework-guides` },
    );
  }
  items.push(
    { text: L.configuration, link: `${p}/configuration` },
    { text: L.interceptors, link: `${p}/interceptors-middleware` },
    { text: L.retryCache, link: `${p}/retry-cache` },
    { text: L.errorsSecurity, link: `${p}/errors-security` },
  );
  return [{ text: "openFetch", items }];
}

const localeConfigs = Object.fromEntries(
  LANGS.map((code) => {
    const langAttr =
      code === "kr" ? "ko" : code === "ku" ? "ku" : code;
    const label =
      code === "ar"
        ? "العربية"
        : code === "es"
          ? "Español"
          : code === "fa"
            ? "فارسی"
            : code === "fr"
              ? "Français"
              : code === "hi"
                ? "हिन्दी"
                : code === "it"
                  ? "Italiano"
                  : code === "ja"
                    ? "日本語"
                    : code === "kr"
                      ? "한국어 (kr)"
                      : "Kurdî";
    const entry: {
      label: string;
      lang: string;
      link: string;
      dir?: "ltr" | "rtl";
      themeConfig: {
        langMenuLabel: string;
        nav: { text: string; link: string }[];
        sidebar: ReturnType<typeof sidebarFor>;
        outline: { level: [number, number] };
      };
    } = {
      label,
      lang: langAttr,
      link: `/${code}/`,
      themeConfig: {
        langMenuLabel:
          code === "ar"
            ? "اللغة"
            : code === "fa"
              ? "زبان"
              : code === "ja"
                ? "言語"
                : code === "kr"
                  ? "언어"
                  : "Language",
        nav: [
          {
            text: LABELS[code].gettingStarted,
            link: `/${code}/getting-started`,
          },
          { text: LANG_HOME_LABEL[code], link: "/languages/" },
        ],
        sidebar: sidebarFor(code),
        outline: { level: [2, 3] },
      },
    };
    if (code === "fa" || code === "ar") entry.dir = "rtl";
    return [code, entry];
  })
) as Record<
  string,
  {
    label: string;
    lang: string;
    link: string;
    dir?: "ltr" | "rtl";
    themeConfig: object;
  }
>;

export default defineConfig({
  // GitHub Pages project site: https://openfetch-js.github.io/openfetch-docs/
  base: "/openfetch-docs/",
  title: "openFetch",
  description:
    "Documentation for @hamdymohamedak/openfetch — fetch-based HTTP client with interceptors, middleware, retry, and cache.",
  srcExclude: ["README.md", "skills.md"],
  lastUpdated: true,
  themeConfig: {
    search: { provider: "local" },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/openfetch-js/OpenFetch",
        ariaLabel: "openFetch on GitHub",
      },
      {
        icon: "npm",
        link: "https://www.npmjs.com/package/@hamdymohamedak/openfetch",
        ariaLabel: "npm package @hamdymohamedak/openfetch",
      },
    ],
    footer: {
      message: "MIT · @hamdymohamedak/openfetch",
    },
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      link: "/",
      themeConfig: {
        langMenuLabel: "Language",
        nav: [
          { text: "Guide", link: "/getting-started" },
          { text: "Languages", link: "/languages/" },
        ],
        sidebar: sidebarRoot(),
        outline: { level: [2, 3] },
      },
    },
    ...localeConfigs,
  },
});
