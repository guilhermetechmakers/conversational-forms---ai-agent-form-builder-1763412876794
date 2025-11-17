import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const passwordRules: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "One lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "One number",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "One special character",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const metRules = passwordRules.filter((rule) => rule.test(password));
  const allMet = metRules.length === passwordRules.length;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1.5">
        {passwordRules.map((rule, index) => {
          const isMet = rule.test(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-all duration-200",
                isMet ? "text-accent" : "text-muted-foreground"
              )}
            >
              {isMet ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn("transition-colors", isMet && "font-medium")}>{rule.label}</span>
            </div>
          );
        })}
      </div>
      
      {allMet && (
        <div className="pt-1.5 border-t border-border">
          <p className="text-xs font-medium text-accent flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Password meets all requirements
          </p>
        </div>
      )}
    </div>
  );
}
