import { HTMLAttributes } from "react";
import { Container } from "./Container";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  light?: boolean;
  narrow?: boolean;
  as?: "section" | "div" | "article";
}

export function Section({
  children,
  light = false,
  narrow = false,
  as: Tag = "section",
  className = "",
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={[
        "py-24 md:py-32",
        light ? "panel-light" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      <Container narrow={narrow}>{children}</Container>
    </Tag>
  );
}
