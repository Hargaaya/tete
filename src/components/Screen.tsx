import type { ReactNode } from "react";

type Props = {
  background?: string;
  className?: string;
  children: ReactNode;
};

export default function Screen({ background = "bg-grey-100", className = "", children }: Props) {
  return <div className={`min-h-screen ${background} ${className}`}>{children}</div>;
}
