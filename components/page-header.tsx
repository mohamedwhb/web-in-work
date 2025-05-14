import { cn } from "@/lib/utils";
import type React from "react";

interface PageHeaderProps {
  heading: string;
  description?: string;
  headerClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  heading,
  description,
  headerClassName = "",
}) => {
  return (
    <div>
      <h1 className={cn("text-3xl font-bold", headerClassName)}>{heading}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
