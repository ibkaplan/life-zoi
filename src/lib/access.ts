export type Principal =
  | { kind: "local-device" }
  | { kind: "account"; userId: string };

export const LOCAL_DEVICE_OWNER = "local-device";

export function canAccessRecord(principal: Principal, ownerId: string): boolean {
  if (!ownerId) return false;
  if (principal.kind === "local-device") {
    return ownerId === LOCAL_DEVICE_OWNER;
  }
  return principal.userId.length > 0 && principal.userId === ownerId;
}
