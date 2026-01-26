import Counter from "@/models/Counter";

export const generateOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const sequence = counter.seq.toString().padStart(6, "0");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return `OD-${date}-${sequence}`;
};