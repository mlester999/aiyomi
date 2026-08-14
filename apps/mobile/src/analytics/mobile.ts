import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@aiyomi/analytics";
import * as Crypto from "expo-crypto";

import { getInstallationId } from "../storage/local";

export interface MobileAnalyticsContext {
  anonymousInstallationId: string;
  anonymousSessionId: string;
}

export interface MobileAnalyticsEvent<Name extends AnalyticsEventName> {
  name: Name;
  properties?: AnalyticsEventProperties[Name];
  context: Readonly<MobileAnalyticsContext>;
}

export type MobileAnalyticsSink = <Name extends AnalyticsEventName>(
  event: MobileAnalyticsEvent<Name>,
) => void;

let analyticsSink: MobileAnalyticsSink | null = null;
let anonymousContextPromise: Promise<Readonly<MobileAnalyticsContext>> | null =
  null;

const getAnonymousContext = (): Promise<Readonly<MobileAnalyticsContext>> => {
  if (anonymousContextPromise) return anonymousContextPromise;

  const anonymousSessionId = Crypto.randomUUID();
  anonymousContextPromise = getInstallationId()
    .then((anonymousInstallationId) =>
      Object.freeze({ anonymousInstallationId, anonymousSessionId }),
    )
    .catch((error: unknown) => {
      anonymousContextPromise = null;
      throw error;
    });
  return anonymousContextPromise;
};

export const setMobileAnalyticsSink = (sink: MobileAnalyticsSink | null) => {
  analyticsSink = sink;
};

export const trackMobileEvent = <Name extends AnalyticsEventName>(
  name: Name,
  properties?: AnalyticsEventProperties[Name],
) => {
  const sink = analyticsSink;
  if (!sink) return;

  const eventProperties = properties ? { ...properties } : properties;
  void getAnonymousContext()
    .then((context) => {
      if (analyticsSink !== sink) return;
      sink({ name, properties: eventProperties, context });
    })
    .catch(() => {
      // Analytics is optional and must never block or interrupt the product.
    });
};
