import type { DynField, DynFieldType } from "./types";


export function defaultForType(t: DynFieldType) {
    switch (t) {
        case "number":
            return undefined;
        default:
            return "";
    }
}


export function mergeValues(
    fields: DynField[],
    base?: Record<string, any>,
    patch?: Record<string, any>
) {
    const out: Record<string, any> = {};
    for (const f of fields) {
        const b = base?.[f.id];
        const p = patch?.[f.id];
        out[f.id] = p ?? b ?? defaultForType(f.type);
    }
    return out;
}


export function computeMissingRequired(fields: DynField[], values: Record<string, any>) {
    const missing: string[] = [];
    for (const f of fields) {
        if (!f.required) continue;
        const v = values[f.id];
        const isEmpty = v === undefined || v === null || (typeof v === "string" && v.trim() === "");
        if (isEmpty) missing.push(f.id);
    }
    return missing;
}