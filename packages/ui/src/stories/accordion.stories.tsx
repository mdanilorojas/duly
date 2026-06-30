import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion.js";

const meta = { title: "Display/Accordion" };
export default meta;
type S = StoryObj<typeof meta>;

const items = [
  {
    value: "what",
    trigger: "What does this agent do?",
    content:
      "This agent processes incoming predio records, validates their geometry against ArcGIS, and emits a colour-coded GeoJSON output for downstream consumers.",
  },
  {
    value: "configure",
    trigger: "How do I configure it?",
    content:
      "Set PIPELINE_BATCH_SIZE and ARCGIS_ENDPOINT in your environment. Optional: RETRY_LIMIT (default 3) and TIMEOUT_MS (default 5000).",
  },
  {
    value: "errors",
    trigger: "Error handling",
    content:
      "On geometry failure the record is flagged warn. On validation failure it is flagged block. Both are included in the output with the relevant tone so downstream agents can filter.",
  },
];

export const Default: S = {
  render: () => (
    <Accordion type="single" collapsible className="w-96">
      {items.map(({ value, trigger, content }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{trigger}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: S = {
  render: () => (
    <Accordion type="multiple" className="w-96">
      {items.map(({ value, trigger, content }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{trigger}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
