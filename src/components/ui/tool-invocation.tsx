import { Card } from "@/components/ui/card";
// import { idToReadableText } from "@/lib/id-parsing";
import { cn } from "@/lib/utils";
import { CheckCircleIcon } from "lucide-react";
import { AnimatedPyramidIcon } from "../icons/loading-pyramid";

export function ToolInvocation({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Card className={cn("max-w-full py-3 gap-3", className)}>{children}</Card>
	);
}

export function ToolInvocationHeader({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("flex flex-col items-stretch gap-2 px-4", className)}>
			{children}
		</div>
	);
}

export function ToolInvocationContent({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return <div className={cn("px-6", className)}>{children}</div>;
}

export function ToolInvocationName({
	name,
	capitalize = true,
	type,
	className,
}: {
	name: string;
	capitalize?: boolean;
	type: "tool-call" | "tool-result";
	className?: string;
}) {
	return (
		<span className={cn("flex items-center gap-2 text-sm", className)}>
			{type === "tool-call" && (
				<AnimatedPyramidIcon
					className="size-4 text-muted-foreground"
					duration="2s"
				/>
			)}
			{type === "tool-result" && (
				<CheckCircleIcon className="size-4 text-muted-foreground" />
			)}
			<span className="font-medium">
				{/* {idToReadableText(name, { capitalize })} */}
			</span>
		</span>
	);
}
