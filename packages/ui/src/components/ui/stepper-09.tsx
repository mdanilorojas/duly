"use client";

import { useState } from "react";
import {
  FlowStepper,
  FlowStepperItem,
  FlowStepperTrigger,
  FlowStepperIndicator,
  FlowStepperSeparator,
  FlowStepperNav,
  FlowStepperTitle,
  FlowStepperPanel,
  FlowStepperDescription,
  FlowStepperContent,
} from "@/components/ui/flow-stepper";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, CodeIcon, AwardIcon, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const steps = [
  {
    id: "details",
    title: "Details",
    description: "Enter the required details for this step",
    icon: <BookOpenIcon />,
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm your information and choices",
    icon: <CodeIcon />,
  },
  {
    id: "done",
    title: "Done",
    description: "All set. review completed",
    icon: <AwardIcon />,
  },
];

const StepperVerticalDemo = () => {
  const [current, setCurrent] = useState(steps[0].id);

  const currentIndex = steps.findIndex((s) => s.id === current);
  const goNext = () => setCurrent(steps[Math.min(currentIndex + 1, steps.length - 1)].id);
  const goBack = () => setCurrent(steps[Math.max(currentIndex - 1, 0)].id);

  return (
    <div className="flex items-center justify-center">
      <FlowStepper
        steps={steps}
        value={current}
        onValueChange={setCurrent}
        className="flex items-center justify-center gap-10 max-lg:flex-col max-lg:items-start"
        orientation="vertical"
      >
        <FlowStepperNav className="w-60">
          {steps.map((step, index) => (
            <FlowStepperItem key={step.id} stepId={step.id} className="relative items-start">
              <FlowStepperTrigger className="items-start gap-2.5 pb-15 last:pb-0">
                <FlowStepperIndicator>{index + 1}</FlowStepperIndicator>
                <div className="text-left">
                  <FlowStepperTitle>{step.title}</FlowStepperTitle>
                  <FlowStepperDescription>{step.description}</FlowStepperDescription>
                </div>
              </FlowStepperTrigger>
              {index < steps.length - 1 && (
                <FlowStepperSeparator className="absolute inset-y-0 top-[calc(50%-22px)] left-2 group-data-[orientation=vertical]/flow-stepper-nav:h-15" />
              )}
            </FlowStepperItem>
          ))}
        </FlowStepperNav>
        <FlowStepperPanel className="w-xs text-center text-sm sm:w-116">
          {steps.map((step) => (
            <FlowStepperContent key={step.id} value={step.id}>
              <div className="bg-surface-2 border-accent/15 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-4 md:p-8">
                <div className="space-y-2">
                  <h3 className="text-dim text-lg font-medium">{step.title}</h3>
                  <p className="text-dim text-sm">{step.description}</p>
                </div>

                <div className="w-full">
                  <div className="text-dim flex h-36 items-center justify-center">
                    <span className="text-base">{step.title} content</span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      onClick={goBack}
                      disabled={currentIndex === 0}
                      variant={currentIndex === 0 ? "secondary" : "default"}
                    >
                      <ArrowLeftIcon className="size-4" /> Back
                    </Button>

                    <Button
                      onClick={goNext}
                      disabled={currentIndex === steps.length - 1}
                      variant={currentIndex === steps.length - 1 ? "secondary" : "default"}
                    >
                      Next <ArrowRightIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </FlowStepperContent>
          ))}
        </FlowStepperPanel>
      </FlowStepper>
    </div>
  );
};

export default StepperVerticalDemo;
