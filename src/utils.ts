import { v4 as uuid } from "uuid";

export type id = string;
export type key = string;

export type config = Record<string, string | undefined>;

export function generateId(): id {
    return uuid();
}

export function generateKey(): key {
    return uuid().replaceAll("-", "").toLocaleUpperCase();
}