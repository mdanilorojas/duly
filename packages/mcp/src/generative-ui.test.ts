import { describe, expect, it } from "vitest";
import { exampleGenerativeUi, getGenerativeUiSchema, validateGenerativeUi } from "./generative-ui.js";

function minimal(nodes: unknown[]) {
  return {
    version: "1",
    auditId: "sample-doc",
    theme: "cockpit",
    locale: "en",
    title: "Sample",
    nodes,
  };
}

describe("generative UI contract", () => {
  it("accepts the cockpit example and is pure", () => {
    const example = exampleGenerativeUi();
    const first = validateGenerativeUi(example);
    const second = validateGenerativeUi(example);
    expect(first.ok).toBe(true);
    expect(first.errors).toEqual([]);
    expect(first).toEqual(second);
    expect(first.auditId).toBe("cockpit-sample");
    expect(first.theme).toBe("cockpit");
    expect(first.locale).toBe("en");
    expect(first.rules.every((rule) => rule.passed)).toBe(true);
    expect(first.components).toContain("HumanInterruptQueue");
    expect(first.nodeIds).toContain("pay-4800");
  });

  it("returns that example from the schema tool payload", () => {
    const schema = getGenerativeUiSchema();
    expect(schema.version).toBe("1");
    expect(schema.example).toEqual(exampleGenerativeUi());
    expect(schema.themes).toEqual(expect.arrayContaining(["cockpit", "light", "violet", "ganapliego"]));
  });

  it("rejects an unknown component and a raw color", () => {
    const audit = validateGenerativeUi(
      minimal([
        {
          id: "raw",
          component: "RawHtml",
          props: { html: "<div style='color:#ff0000'>nope</div>" },
        },
      ]),
    );
    expect(audit.ok).toBe(false);
    const rules = audit.errors.map((error) => error.rule);
    expect(rules).toContain("components.allow_list");
    expect(rules).toContain("props.no_raw_color");
    expect(rules).toContain("props.no_style_escape");
  });

  it("rejects skipConfirmation on a block-risk approval", () => {
    const audit = validateGenerativeUi(
      minimal([
        {
          id: "queue",
          component: "HumanInterruptQueue",
          props: {
            title: "Approval queue",
            items: [
              {
                id: "pay",
                action: "Send vendor payment",
                agent: "TREASURY",
                riskTone: "block",
                riskLabel: "Critical risk",
                what: "Pay the invoice.",
                why: "The payout account changed.",
                blastRadius: "One vendor.",
                rollback: "Ask for a recall.",
                requestedAt: "2m ago",
                ageMinutes: 2,
                skipConfirmation: true,
              },
            ],
          },
        },
      ]),
    );
    expect(audit.ok).toBe(false);
    expect(audit.errors.some((error) => error.rule === "approval.no_skip_confirm")).toBe(true);
  });

  it("rejects an unknown theme and a duplicate id", () => {
    const audit = validateGenerativeUi({
      ...minimal([{ id: "sample-doc", component: "AgentMetric", props: { label: "Pending reviews", value: "1" } }]),
      theme: "nope",
    });
    expect(audit.errors.map((error) => error.rule)).toEqual(expect.arrayContaining(["theme.known", "audit.stable_ids"]));
  });
});
