type Props = React.PropsWithChildren<{ className?: string }>;
export default function Container({ children, className = "" }: Props) {
  return <div className={`mx-auto w-full max-w-6xl px-5 ${className}`}>{children}</div>;
}
