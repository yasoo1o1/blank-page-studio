import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-700 group-[.toaster]:!border-red-300 group-[.toaster]:!shadow-[0_10px_30px_-10px_rgba(220,38,38,0.35)] [&_[data-icon]]:!text-red-600 [&_[data-title]]:!text-red-700 [&_[data-description]]:!text-red-600/80 [&_[data-close-button]]:!text-red-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
