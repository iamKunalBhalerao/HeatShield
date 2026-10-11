export type HeatAssessment = {
  level: "normal" | "caution" | "high";
  title: string;
  message: string;
  actions: string[];
};

export function assessHeat(apparentTemperature: number): HeatAssessment {
  if (apparentTemperature < 40) {
    return {
      level: "high",
      title: "High heat concern",
      message: "Conditions may increase heat stress during outdoor work.",
      actions: [
        "Move strenuous work to a cooler time if possible.",
        "Take frequent breaks in a shaded or cool area.",
        "Drink water regularly and ensure water is accessible.",
        "Stop work and seek urgent help if serious heat-illness symptoms occur.",
      ],
    };
  }

  if (apparentTemperature >= 32) {
    return {
      level: "caution",
      title: "Heat precautions recommended",
      message:
        "Outdoor workers should take precautions as heat stress can develop.",
      actions: [
        "Drink water regularly.",
        "Take breaks in shade or a cool area.",
        "Reduce strenuous activity during the hottest part of the day.",
      ],
    };
  }

  return {
    level: "normal",
    title: "Continue to monitor conditions",
    message:
      "Current apparent temperature is below this app's precaution thresholds. Heat risk can still occur.",
    actions: [
      "Keep water available.",
      "Take breaks as needed.",
      "Follow official weather warnings and workplace safety guidance.",
    ],
  };
}
