import React, { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  return (
    <Suspense fallback={<p>Loading sign-in...</p>}>
      <SignInClient />
    </Suspense>
  );
}
