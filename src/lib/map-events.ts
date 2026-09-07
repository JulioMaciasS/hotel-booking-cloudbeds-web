export const MAP_EXPANDED_EVENT = "los-lagos:map-expanded";
export const MAP_TOOL_EVENT = "los-lagos:map-tool";

export type MapExpandedEventDetail = {
  expanded: boolean;
};

export type MapTool = "filters" | "search" | null;

export type MapToolEventDetail = {
  tool: MapTool;
};
