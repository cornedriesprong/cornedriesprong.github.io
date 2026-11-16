import { LOCALE } from "@config";

export interface Props {
  datetime: string | Date;
  size?: "sm" | "lg";
  className?: string;
}

// "Last updated" date for a note.
export default function Datetime({
  datetime,
  size = "sm",
  className = "",
}: Props) {
  const date = new Date(datetime);
  return (
    <div className={`opacity-80 ${className}`}>
      <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
        Last updated{" "}
        <time dateTime={date.toISOString()}>
          {date.toLocaleDateString(LOCALE, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </span>
    </div>
  );
}
