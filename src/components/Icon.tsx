import { FC } from "react";

type ChevronDirection = "up" | "down";

interface ChevronIconProps {
  direction: ChevronDirection;
  className?: string;
}

const ChevronIcon: FC<ChevronIconProps> = ({ direction, className }) => {
  const pathD = direction === "up" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={pathD}
      />
    </svg>
  );
};

export default ChevronIcon;
