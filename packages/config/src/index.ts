declare const process: {
  env: {
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_ADMIN_URL?: string;
    NEXT_PUBLIC_SUPPORT_EMAIL?: string;
    NEXT_PUBLIC_APP_STORE_URL?: string;
    NEXT_PUBLIC_GOOGLE_PLAY_URL?: string;
    NEXT_PUBLIC_ABOUT_URL?: string;
    NEXT_PUBLIC_CONTACT_URL?: string;
    NEXT_PUBLIC_PRIVACY_URL?: string;
    NEXT_PUBLIC_TERMS_URL?: string;
    NEXT_PUBLIC_INSTAGRAM_URL?: string;
    NEXT_PUBLIC_FACEBOOK_URL?: string;
    NEXT_PUBLIC_TIKTOK_URL?: string;
    NEXT_PUBLIC_X_URL?: string;
  };
};

const optionalPublicValue = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export interface BrandConfig {
  name: "Aiyomi";
  tagline: string;
  description: string;
  siteUrl: string;
  adminUrl?: string;
  supportEmail?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  aboutUrl?: string;
  contactUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    x?: string;
  };
}

const instagramUrl = optionalPublicValue(
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
);
const facebookUrl = optionalPublicValue(process.env.NEXT_PUBLIC_FACEBOOK_URL);
const tiktokUrl = optionalPublicValue(process.env.NEXT_PUBLIC_TIKTOK_URL);
const xUrl = optionalPublicValue(process.env.NEXT_PUBLIC_X_URL);

export const brandConfig: Readonly<BrandConfig> = Object.freeze({
  name: "Aiyomi",
  tagline: "Your AI companion for better days.",
  description:
    "Plan with care, focus on what matters, and grow with an AI life companion that learns what works for you.",
  siteUrl:
    optionalPublicValue(process.env.NEXT_PUBLIC_SITE_URL) ??
    "http://localhost:3000",
  adminUrl: optionalPublicValue(process.env.NEXT_PUBLIC_ADMIN_URL),
  supportEmail: optionalPublicValue(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  appStoreUrl: optionalPublicValue(process.env.NEXT_PUBLIC_APP_STORE_URL),
  googlePlayUrl: optionalPublicValue(process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL),
  aboutUrl: optionalPublicValue(process.env.NEXT_PUBLIC_ABOUT_URL),
  contactUrl: optionalPublicValue(process.env.NEXT_PUBLIC_CONTACT_URL),
  privacyUrl: optionalPublicValue(process.env.NEXT_PUBLIC_PRIVACY_URL),
  termsUrl: optionalPublicValue(process.env.NEXT_PUBLIC_TERMS_URL),
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  xUrl,
  socialLinks: Object.freeze({
    instagram: instagramUrl,
    facebook: facebookUrl,
    tiktok: tiktokUrl,
    x: xUrl,
  }),
});

export const publicNavigation = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Companions", href: "#companions" },
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
] as const;
