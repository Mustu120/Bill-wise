import logoImage from '@assets/generated_images/FlowChain_app_logo_772a0c96.png';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <img src={logoImage} alt="FlowChain Logo" className={className} />
      <span className="text-2xl font-bold text-foreground">FlowChain</span>
    </div>
  );
}
