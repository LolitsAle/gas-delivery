import test from "node:test";
import assert from "node:assert/strict";
import { calculateCheckoutTotals } from "./orderPricing";

test("Case A: MIN_SUBTOTAL order-level promotion only reduces total", () => {
  const result = calculateCheckoutTotals({
    itemsSubtotal: 120000,
    itemDiscountTotal: 0,
    orderPromotions: [
      {
        id: "promo-min-subtotal",
        actions: [{ type: "DISCOUNT_AMOUNT", value: 15000 }],
      },
    ],
  });

  assert.equal(result.orderDiscountTotal, 15000);
  assert.equal(result.totalDiscount, 15000);
  assert.equal(result.totalPrice, 105000);
});

test("Case B: item discount + order-level discount are additive", () => {
  const result = calculateCheckoutTotals({
    itemsSubtotal: 200000,
    itemDiscountTotal: 20000,
    orderPromotions: [
      {
        id: "promo-order-fixed",
        actions: [{ type: "DISCOUNT_AMOUNT", value: 5000 }],
      },
    ],
  });

  assert.equal(result.itemDiscountTotal, 20000);
  assert.equal(result.orderDiscountTotal, 5000);
  assert.equal(result.totalDiscount, 25000);
  assert.equal(result.totalPrice, 175000);
});

test("Case C: order-level percent + fixed discount", () => {
  const result = calculateCheckoutTotals({
    itemsSubtotal: 200000,
    itemDiscountTotal: 0,
    orderPromotions: [
      {
        id: "promo-percent-and-fixed",
        actions: [
          { type: "DISCOUNT_PERCENT", value: 10 },
          { type: "DISCOUNT_AMOUNT", value: 5000 },
        ],
      },
    ],
  });

  assert.equal(result.orderDiscountTotal, 25000);
  assert.equal(result.totalPrice, 175000);
});

test("Case D: discount clamp to non-negative payable", () => {
  const result = calculateCheckoutTotals({
    itemsSubtotal: 100000,
    itemDiscountTotal: 0,
    orderPromotions: [
      {
        id: "promo-over-discount",
        actions: [{ type: "DISCOUNT_AMOUNT", value: 500000 }],
      },
    ],
  });

  assert.equal(result.orderDiscountTotal, 100000);
  assert.equal(result.totalDiscount, 100000);
  assert.equal(result.totalPrice, 0);
});
