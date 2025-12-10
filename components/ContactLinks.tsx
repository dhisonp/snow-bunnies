import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactLinks() {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider">
        Made with love & a skipped dinner - Dhison
      </span>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          asChild
          className="h-7 text-xs px-3 border-2 border-foreground"
        >
          <Link href="https://dev.dhisvn.co" target="_blank">
            WEB
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-7 text-xs px-3"
        >
          <Link href="mailto:dhisonp@gmail.com">EMAIL</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-7 text-xs px-3"
        >
          <Link href="https://instagram.com/dhisvn" target="_blank">
            INSTA
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-7 text-xs px-3"
        >
          <Link href="https://twitter.com/dhisonpadma" target="_blank">
            TWITTER
          </Link>
        </Button>
      </div>
    </div>
  );
}
