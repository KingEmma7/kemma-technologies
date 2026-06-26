import { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  narrow?: boolean;
}

export function Container({ children, narrow = false, className = "", ...rest }: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-6 md:px-10 lg:px-16",
        narrow ? "max-w-3xl" : "max-w-7xl",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
