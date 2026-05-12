import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CloudbedsImmersiveElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    currency?: string;
    mode?: "standard" | "popup";
    "property-code"?: string;
  },
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "cb-immersive-experience": CloudbedsImmersiveElementProps;
    }
  }
}
