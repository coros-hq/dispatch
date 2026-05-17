import Logo from "@/assets/logo.svg";

type Props = {
  text?: string;
};

export default function Loader({ text = "Loading..." }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="relative flex items-center justify-center">
        {/* Spinning ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-border border-t-primary" />
        {/* Logo in center */}
        <img src={Logo} alt="MailShot" className="absolute h-7 w-7" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
