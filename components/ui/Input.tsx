"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

const baseClasses = [
  "w-full bg-transparent border-b border-[var(--border)]",
  "py-3 px-0 text-[var(--foreground)] placeholder:text-[var(--muted)]",
  "focus:outline-none focus:border-[var(--gold)]",
  "transition-colors duration-200",
].join(" ");

const errorClasses = "border-[var(--error)] focus:border-[var(--error)]";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id: idProp, ...rest }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        <label htmlFor={id} className="text-xs uppercase tracking-widest text-[var(--muted)]">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[baseClasses, error ? errorClasses : ""].join(" ")}
          {...rest}
        />
        {error && (
          <span id={errorId} role="alert" className="text-xs text-[var(--error)] mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id: idProp, ...rest }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        <label htmlFor={id} className="text-xs uppercase tracking-widest text-[var(--muted)]">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={5}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[baseClasses, "resize-none", error ? errorClasses : ""].join(" ")}
          {...rest}
        />
        {error && (
          <span id={errorId} role="alert" className="text-xs text-[var(--error)] mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
