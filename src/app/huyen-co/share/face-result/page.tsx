import React, { Suspense } from "react";
import FaceShareClient from "./FaceShareClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FaceShareClient />
    </Suspense>
  );
}
