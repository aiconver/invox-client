"use client";

import * as React from "react";
import {
  Panel as BasePanel,
  PanelGroup as BasePanelGroup,
  PanelResizeHandle as BasePanelResizeHandle,
} from "react-resizable-panels";

// Lightweight classnames helper (avoids requiring @/lib/utils)
function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// Types derived from the underlying components so we don't rely on library types being exported
export type ResizablePanelGroupProps = React.ComponentProps<typeof BasePanelGroup>;
export type ResizablePanelProps = React.ComponentProps<typeof BasePanel>;
export type ResizableHandleProps = React.ComponentProps<typeof BasePanelResizeHandle> & {
  withHandle?: boolean;
};

/**
 * A wrapper around `react-resizable-panels` with sensible defaults that match shadcn/ui styling.
 *
 * Usage:
 * <ResizablePanelGroup direction="horizontal" className="h-96">
 *   <ResizablePanel defaultSize={40}>left</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel defaultSize={60}>right</ResizablePanel>
 * </ResizablePanelGroup>
 */
export function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
  return (
    <BasePanelGroup
      className={cx("flex h-full w-full", className)}
      {...props}
    />
  );
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <BasePanel className={className} {...props} />;
}

export function ResizableHandle({ withHandle = false, className, ...props }: ResizableHandleProps) {
  return (
    <BasePanelResizeHandle
      className={cx(
        // base rail
        "relative flex w-px items-center justify-center bg-border",
        // hover/active feedback
        "transition-colors hover:bg-primary/70 data-[resize-handle-active]:bg-primary",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <div className="pointer-events-none z-10 h-4 w-4 rounded-full border bg-background shadow ring-1 ring-border" />
      ) : null}
    </BasePanelResizeHandle>
  );
}

// Re-export underlying components in case you need advanced props
export const Panel = BasePanel;
export const PanelGroup = BasePanelGroup;
export const PanelResizeHandle = BasePanelResizeHandle;
