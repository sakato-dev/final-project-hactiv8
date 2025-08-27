import { redirect } from "next/navigation";
import React from "react";

function page() {
  redirect("/cashier/home");
}

export default page;
