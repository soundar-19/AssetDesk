export const ASSET_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'ACCESSORIES'] as const;
export const ASSET_TYPES = ['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'TABLET', 'KEYBOARD', 'MOUSE', 'HEADSET', 'WEBCAM', 'CABLE', 'ADAPTER', 'CHARGER', 'DOCKING_STATION', 'LICENSE'] as const;
export const ASSET_STATUSES = ['AVAILABLE', 'ALLOCATED', 'MAINTENANCE', 'RETIRED', 'LOST'] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];
export type AssetType = typeof ASSET_TYPES[number];
export type AssetStatus = typeof ASSET_STATUSES[number];