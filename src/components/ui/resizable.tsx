"use client";

import * as React from "react";
import {
  Panel as BasePanel,
  PanelGroup as BasePanelGroup,
  PanelResizeHandle as BasePanelResizeHandle,
} from "react-resizable-panels";

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type ResizablePanelGroupProps = React.ComponentProps<typeof BasePanelGroup>;
export type ResizablePanelProps = React.ComponentProps<typeof BasePanel>;
export type ResizableHandleProps = React.ComponentProps<typeof BasePanelResizeHandle> & {
  withHandle?: boolean;
};

export function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
  return <BasePanelGroup className={cx("flex h-full w-full", className)} {...props} />;
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  // min-w-0 lets children shrink; overflow-hidden ensures inner scroll areas work
  return <BasePanel className={cx("min-w-0 overflow-hidden", className)} {...props} />;
}

export function ResizableHandle({ withHandle = false, className, ...props }: ResizableHandleProps) {
  return (
    <BasePanelResizeHandle
      className={cx(
        "relative flex w-[2px] items-center justify-center bg-border",
        "transition-colors hover:bg-primary/70 data-[resize-handle-active]:bg-primary",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <div className="pointer-events-none z-10 grid place-items-center rounded-full border bg-background shadow ring-1 ring-border h-5 w-5">
          <div className="h-1 w-3 rounded-full bg-muted-foreground/40" />
        </div>
      ) : null}
    </BasePanelResizeHandle>
  );
}

export const Panel = BasePanel;
export const PanelGroup = BasePanelGroup;
export const PanelResizeHandle = BasePanelResizeHandle;
