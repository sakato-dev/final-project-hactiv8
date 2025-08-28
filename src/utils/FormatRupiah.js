export default function formatRupiah(angka) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(angka);
}
