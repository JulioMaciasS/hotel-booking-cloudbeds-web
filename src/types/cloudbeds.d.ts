import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CloudbedsImmersiveElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    currency?: string;
    "hide-custom-footer"?: "yes" | "no";
    "hide-custom-header"?: "yes" | "no";
    "hide-property-info"?: "yes" | "no";
    lang?: string;
    mode?: "standard" | "popup";
    "property-code"?: string;
  },
  HTMLElement
>;

type CloudbedsPropertyDatePickerElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    "button-label"?: string;
    "class-name"?: string;
    currency?: string;
    "custom-url"?: string;
    lang?: string;
    layout?: "horizontal" | "vertical";
    "open-in-new-tab"?: "true" | "false";
    "property-code"?: string;
  },
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "cb-immersive-experience": CloudbedsImmersiveElementProps;
      "cb-property-date-picker": CloudbedsPropertyDatePickerElementProps;
    }
  }
}
