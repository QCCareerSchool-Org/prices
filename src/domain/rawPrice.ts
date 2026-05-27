export interface RawPrice {
  // noShipping: number;
  code: string;
  currencyCode: string;
  cost: number;
  multiCourseDiscountRate: number;
  deposit: number;
  discount: number;
  partDiscount: number;
  installments: number | null;
  courseCode: string;
  courseName: string;
  shipping: number;
  order: number;
}
