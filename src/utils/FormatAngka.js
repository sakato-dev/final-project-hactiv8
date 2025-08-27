import React from "react";

export default function formatAngka(angka) {
  return new Intl.NumberFormat("id-ID").format(angka);
}
