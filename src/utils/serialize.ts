import { isPublicKey } from "@saberhq/solana-contrib";
import { Fraction, Percent } from "@saberhq/token-utils";
import { isBN } from "bn.js";
import fastStableStringify from "fast-json-stable-stringify";

export const serialize = (_key: string, value: unknown): unknown => {
  if (isPublicKey(value)) {
    return value.toString();
  }
  if (Percent.isPercent(value) || Fraction.isFraction(value)) {
    return {
      formatted: value.toFixed(10),
      numerator: value.numerator.toString(),
      denominator: value.denominator.toString(),
    };
  }
  try {
    if (value && isBN(value)) {
      return value.toString();
    }
  } catch (e) {
    // nothing
  }
  return value;
};

export const jsonStringify = (value: unknown): string =>
  JSON.stringify(value, serialize, 2);

export const makeSerializable = (value: unknown): unknown =>
  JSON.parse(jsonStringify(value));

export const stableStringify = (value: unknown): string =>
  jsonStringify(JSON.parse(fastStableStringify(makeSerializable(value))));
