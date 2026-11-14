import type { Language } from "@/i18n/language";
import welcomePt from "@/assets/app-ecra-1.jpg";
import actionsPt from "@/assets/app-ecra-2.png";
import createPt from "@/assets/app-ecra-3.png";
import explorePt from "@/assets/app-explorar-foz.png";
import partnersPt from "@/assets/app-ligate.png";
import trainingPt from "@/assets/treino-lisboa-03.png";
import welcomeEN from "@/assets/app-localized/welcome-en.png";
import actionsEN from "@/assets/app-localized/actions-en.png";
import createEN from "@/assets/app-localized/create-en.png";
import exploreEN from "@/assets/app-localized/explore-en.png";
import partnersEN from "@/assets/app-localized/partners-en.png";
import trainingEN from "@/assets/app-localized/training-en.png";
import welcomeES from "@/assets/app-localized/welcome-es.png";
import actionsES from "@/assets/app-localized/actions-es.png";
import createES from "@/assets/app-localized/create-es.png";
import exploreES from "@/assets/app-localized/explore-es.png";
import partnersES from "@/assets/app-localized/partners-es.png";
import trainingES from "@/assets/app-localized/training-es.png";

type ScreenSet = Record<"welcome" | "actions" | "create" | "explore" | "partners" | "training", string>;

// The route language also controls screenshots, including direct links and language switches.
export const appScreens: Record<Language, ScreenSet> = {
  pt: { welcome: welcomePt, actions: actionsPt, create: createPt, explore: explorePt, partners: partnersPt, training: trainingPt },
  en: { welcome: welcomeEN, actions: actionsEN, create: createEN, explore: exploreEN, partners: partnersEN, training: trainingEN },
  es: { welcome: welcomeES, actions: actionsES, create: createES, explore: exploreES, partners: partnersES, training: trainingES },
};

