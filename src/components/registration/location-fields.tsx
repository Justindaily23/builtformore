"use client";

import { useState } from "react";
import { Field, Select } from "@/components/admin/form-parts";
import { OUTSIDE_NIGERIA, stateOptions } from "@/lib/locations";

export function LocationFields({ errors }: { errors?: Record<string, string> }) {
  const [chosen, setChosen] = useState("");
  return (
    <div className="space-y-4" onChange={(e) => {
      const target = e.target as HTMLInputElement;
      if (target.name === "state") setChosen(target.value);
    }}>
      <h2 className="font-display text-2xl">Where are you coming from?</h2>
      <Select idPrefix="r" errors={errors} label="State *" name="state"
        options={[{ value: "", label: "Choose one" }, ...stateOptions.map((s) => ({ value: s, label: s }))]} />
      {chosen === OUTSIDE_NIGERIA && (
        <Field idPrefix="r" errors={errors} label="Country" name="country" required autoComplete="country-name" />
      )}
      <Field idPrefix="r" errors={errors} label="City or town (optional)" name="city" autoComplete="address-level2" />
    </div>
  );
}
