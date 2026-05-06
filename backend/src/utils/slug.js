import crypto from "crypto";

export function makeUniqueSlug(base) {
  const cleaned = String(base || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${cleaned || "org"}-${suffix}`;
}
