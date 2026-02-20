import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg bg-card-bg shadow-md transition-all duration-150 border border-gray-200/80 dark:border-gray-700/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export function CardHoverable({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      className={`rounded-lg bg-card-bg shadow-md transition-all duration-150 border border-gray-200/80 dark:border-gray-700/80 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
