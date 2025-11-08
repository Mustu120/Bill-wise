import logoImage from '@assets/flowchain-logo.jpg';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-16 w-auto" }: LogoProps) {
  return (
    <img src={logoImage} alt="FlowChain Logo" className={className} />
  );
}
