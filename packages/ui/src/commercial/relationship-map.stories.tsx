import type { Meta, StoryObj } from "@storybook/react";
import "@xyflow/react/dist/style.css";
import { RelationshipMap, type Stakeholder, type RelationshipLink } from "./relationship-map.js";

const meta: Meta<typeof RelationshipMap> = {
  title: "Commercial/V001 Relationship Map",
  component: RelationshipMap,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const people: Stakeholder[] = [
  { id: "cfo", name: "Dana Wu", title: "CFO", role: "economic-buyer", influence: 5, position: { x: 200, y: 10 } },
  { id: "vpe", name: "Ivo Park", title: "VP Eng", role: "champion", influence: 4, position: { x: 20, y: 160 } },
  { id: "ciso", name: "Mara Kite", title: "CISO", role: "blocker", influence: 3, position: { x: 200, y: 160 } },
  { id: "arch", name: "Lee Sun", title: "Architect", role: "influencer", influence: 2, position: { x: 380, y: 160 } },
];
const links: RelationshipLink[] = [
  { id: "l1", source: "vpe", target: "cfo", label: "reports" },
  { id: "l2", source: "ciso", target: "cfo" },
  { id: "l3", source: "arch", target: "vpe" },
];

export const BuyingCommittee: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[640px]">
        <RelationshipMap people={people} links={links} ariaLabel="Comité de compra — Acme" onSelect={() => {}} />
      </div>
    </div>
  ),
};
