# `GET /prices` response payload

A successful request returns `200 OK` with a JSON body of type `PriceDTO` ([src/domain/price.ts](../src/domain/price.ts)). The body is built by `PriceSummary.toDTO()` ([src/priceCalculator/priceSummary.ts](../src/priceCalculator/priceSummary.ts)).

All money values are plain JSON numbers, in the currency given by `currency.code`. They are worked out with `big.js` and rounded to 2 decimal places, so you don't need to correct for floating-point drift.

## Top level

| Field | Type | Description |
|---|---|---|
| `countryCode` | `string` | The `countryCode` from the request, unchanged. |
| `provinceCode` | `string?` | The `provinceCode` from the request. Left out when it wasn't sent. |
| `currency` | `Currency` | The currency that every amount is in. See [Currency](#currency). |
| `cost` | `number` | Sum of `courses[].cost`: the list price before any discounts. |
| `multiCourseDiscount` | `number` | Sum of `courses[].multiCourseDiscount`. This includes the full cost of any free courses. |
| `promoDiscount` | `number` | Sum of `courses[].promoDiscount`: promo-code, signed extra-discount, and "without tools" reductions. |
| `discountedCost` | `number` | Sum of `courses[].discountedCost`, which is `cost − multiCourseDiscount − promoDiscount`. |
| `plans` | `{ full: Plan, part: Plan }` | Totals for each payment plan. See [Plans](#plans). |
| `courses` | `CoursePrice[]` | One entry per unique course code requested. See [Courses](#courses). |
| `noShipping` | `boolean` | `true` when we don't ship course materials to `countryCode` (for example, US-embargoed countries). It depends only on the country, not on the `options.noShipping` request flag. |
| `promoCodeRecognized` | `boolean` | Whether `options.promoCode` matched a promotion that's active on the pricing date. |
| `promoCode` | `string?` | The promo code from the request, but only when `promoCodeRecognized` is `true`. Otherwise it's left out. |
| `notes` | `string[]` | Short internal labels for extras that apply, such as `"additional discount"` or `"bonus lashes"`. |
| `disclaimers` | `string[]` | Text that's meant to be shown to the student, such as "You'll receive bonus lashes in your makeup kit". |
| `promoWarnings` | `string[]` | Explains why a recognized promo code doesn't fully apply to the courses selected, for example a required course that's missing. |

> **HTML content:** `disclaimers` and `promoWarnings` can contain HTML markup such as `<strong>…</strong>`, and the front end may render them as raw HTML. They never include user input.

## Currency

| Field | Type | Description |
|---|---|---|
| `code` | `"CAD" \| "USD" \| "GBP" \| "AUD" \| "NZD"` | ISO currency code. |
| `name` | `string` | Display name. |
| `symbol` | `string` | Display symbol, such as `$` or `£`. |
| `exchangeRate` | `number` | Exchange rate from the currency table, rounded to 4 decimal places. |

The currency comes from the course price rows. When no courses are requested, it's chosen from the country: `CA` → CAD, GB-area → GBP, AU-area → AUD, NZ-area → NZD, and anything else → USD.

## Plans

Both the top-level `plans` object and each course's `plans` object contain two `Plan` objects:

- **`full`** – the student pays everything up front.
- **`part`** – the student pays a deposit, then a series of installments.

| Field | Type | Description |
|---|---|---|
| `discount` | `number` | The extra discount for choosing this plan. Only the primary course gets one, and only when no multi-course discount was applied to it. |
| `total` | `number` | `discountedCost − discount`: the amount the student actually pays on this plan. |
| `deposit` | `number` | The amount due today. For `full`, it's the same as `total`. |
| `installments` | `number` | The number of installments after the deposit. Always `0` for `full`. |
| `installmentSize` | `number` | `(total − deposit) / installments`, rounded **down** to the nearest cent. `0` when `installments` is `0`. |
| `remainder` | `number` | The cents left over from rounding: `total − deposit − installmentSize × installments`. |
| `originalDeposit` | `number` | The deposit before `options.depositOverrides` was applied. |
| `originalInstallments` | `number` | The installment count before `options.installmentsOverride` was applied. |

This always holds for the `part` plan:

```
deposit + installmentSize × installments + remainder = total
```

Clients usually add `remainder` to the deposit or to the last installment.

**Top-level plan values:** every money field is the sum of the course values. `installments` and `originalInstallments` are not summed, though. They're taken from the first (primary) course, because every secondary course is set to the primary course's installment count. For `full`, both are always `0`.

## Courses

Each entry in `courses` is a `CoursePrice`. It has the same money fields as the top level (`cost`, `multiCourseDiscount`, `promoDiscount`, `discountedCost`, `plans`), calculated for that one course, plus the fields below.

| Field | Type | Description |
|---|---|---|
| `code` | `string` | The course code, in uppercase. |
| `name` | `string` | The course's display name. |
| `primary` | `boolean` | `true` for the single main course, which is the most expensive non-free course. Only this course can get plan discounts. |
| `free` | `boolean` | `true` when a promotion made this course free. A free course has `discountedCost = 0`, `multiCourseDiscountRate = 1`, and a zero deposit and installment count. |
| `multiCourseDiscountRate` | `number` | A rate between `0` and `1`, such as `0.5` for 50%. It's the rate that would apply, or did apply, to this course as an additional course. |
| `discountMessage` | `string \| null` | A label to show next to the course when a multi-course discount was applied, such as `"50% Discount"`. Otherwise `null`. |
| `order` | `number` | The course's display-order value from the price table. |

### Order of `courses`

Courses are sorted in this order:

1. The primary course first.
2. Paid courses before free courses.
3. Higher `cost` first.
4. Higher `discountedCost` first.
5. Higher `order` first.

### Request details that change the courses

- Course codes are converted to uppercase and de-duplicated, so `?courses[]=mz&courses[]=MZ` returns a single course.
- When `courses` is empty or left out, `courses` is `[]`. In that case every amount, including the plan values, is `0`.

## Example

Here's an abridged response for `?courses[]=MZ&courses[]=SK&countryCode=CA&provinceCode=ON`. The numbers are illustrative only.

```json
{
  "countryCode": "CA",
  "provinceCode": "ON",
  "currency": { "code": "CAD", "name": "Canadian Dollars", "symbol": "$", "exchangeRate": 1.3612 },
  "cost": 2398,
  "multiCourseDiscount": 599.5,
  "promoDiscount": 0,
  "discountedCost": 1798.5,
  "plans": {
    "full": { "discount": 0, "deposit": 1798.5, "installmentSize": 0, "installments": 0, "remainder": 0, "total": 1798.5, "originalDeposit": 1798.5, "originalInstallments": 0 },
    "part": { "discount": 0, "deposit": 200, "installmentSize": 99.91, "installments": 16, "remainder": 0.04, "total": 1798.5, "originalDeposit": 200, "originalInstallments": 16 }
  },
  "courses": [
    {
      "code": "MZ", "name": "Master Makeup Artistry", "primary": true, "free": false,
      "cost": 1199, "multiCourseDiscountRate": 0.5, "multiCourseDiscount": 0, "promoDiscount": 0, "discountedCost": 1199,
      "discountMessage": null, "order": 1,
      "plans": { "full": { "...": "..." }, "part": { "...": "..." } }
    },
    {
      "code": "SK", "name": "Skincare", "primary": false, "free": false,
      "cost": 1199, "multiCourseDiscountRate": 0.5, "multiCourseDiscount": 599.5, "promoDiscount": 0, "discountedCost": 599.5,
      "discountMessage": "50% Discount", "order": 5,
      "plans": { "full": { "...": "..." }, "part": { "...": "..." } }
    }
  ],
  "noShipping": false,
  "promoCodeRecognized": false,
  "notes": [],
  "disclaimers": [],
  "promoWarnings": []
}
```

## Error responses

Errors are returned as a **plain-text** body containing the error message, not as JSON.

| Status | When |
|---|---|
| `400` | Query validation failed (yup), or the request was rejected by a `ClientError`. Examples: an invalid `discountSignature`, `depositOverrides` keys that don't match the courses requested, or an `installmentsOverride` outside 1–24. |
| `403` | Known crawlers, plus bots that request `CA` or `US` prices without a `provinceCode`. |
| `500` | Server errors. Examples: an unsupported currency, price rows in mixed currencies, or a price lookup that failed. |

## Caching headers

Successful responses include these headers:

- `Cache-Control: public, max-age=300`
- `CDN-Cache-Control: max-age=3600, stale-while-revalidate=600`
- `No-Vary-Search` – the order of query keys and the UTM, `gclid`, and `msclkid` parameters don't affect cache hits.
