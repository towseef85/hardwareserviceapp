function asciiWords(value: string) {
  return value.normalize("NFKD").replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
}

export function buildServiceCodeBase(serviceTypeName: string, customerName: string, createdAt = new Date()) {
  const typeWords = asciiWords(serviceTypeName);
  const firstTypeWord = typeWords[0]?.slice(0, 3) || "SRV";
  const remainingTypeCode = typeWords.slice(1).map((word) => `${word[0] ?? ""}${word[2] ?? word[1] ?? ""}`).join("");
  const serviceTypeCode = `${firstTypeWord}${remainingTypeCode}`.slice(0, 8).toUpperCase();
  const customerCode = (asciiWords(customerName).join("").slice(0, 3) || "CUS").toUpperCase();
  const dateCode = `${createdAt.getDate()}${createdAt.getMonth() + 1}${String(createdAt.getFullYear()).slice(-2)}`;
  return `${serviceTypeCode}-${customerCode}-${dateCode}`;
}
