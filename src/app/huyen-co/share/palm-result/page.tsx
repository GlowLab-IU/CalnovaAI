import React, { Suspense } from "react";
import PalmShareClient from "./PalmShareClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PalmShareClient />
    </Suspense>
  );
}
