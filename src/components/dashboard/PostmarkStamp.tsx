type PostmarkStampProps = {
  className?: string;
  label?: string;
};

/**
 * Signature mark for the dashboard: a postmark/cancellation stamp, echoing
 * the envelope in the product's logo and the "dispatch" idea of sending
 * mail out into the world.
 */
export function PostmarkStamp({ className, label }: PostmarkStampProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r="46"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.5 4.5"
      />
      <circle cx="60" cy="60" r="37" stroke="currentColor" strokeWidth="1.2" />
      {label && (
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fill="currentColor"
          fontSize="9.5"
          letterSpacing="2.5"
          fontFamily="var(--font-mono)"
        >
          {label}
        </text>
      )}
      <path
        d="M42 68 L78 68"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M46 74 L74 74"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4 44 L26 50"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4 60 L26 60"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4 76 L26 70"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
