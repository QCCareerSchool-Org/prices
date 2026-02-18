import { getPriceRowToCourseResultMap } from './getPriceRowToCourseResultMap';
import type { CourseResult, PriceRow } from '../../types';

// TODO: test negative cost, negative discount, discount > cost, 0 installment

describe('getPriceRowToCourseResultMap', () => {
  it('should be a function', () => {
    expect(typeof getPriceRowToCourseResultMap).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof getPriceRowToCourseResultMap()).toBe('function');
  });
});

describe('priceRowToCourseResultMap', () => {

  let priceRowToCourseResultMap: (p: PriceRow) => CourseResult;

  describe('when student is false', () => {

    beforeEach(() => {
      priceRowToCourseResultMap = getPriceRowToCourseResultMap(false);
    });

    it('should map PriceRows to CourseResult', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 3232.436,
        multiCourseDiscountRate: 0.3963,
        deposit: 342.311,
        discount: 22.114,
        partDiscount: 0,
        installments: 3.9,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 83.113,
        order: 0,
      };
      const courseResult: CourseResult = {
        code: 'ZU',
        name: 'Zergling Herding',
        primary: false,
        cost: 3232.44,
        multiCourseDiscountRate: 0.40,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 0,
        discountedCost: 3232.44,
        order: 0,
        plans: {
          full: {
            discount: 22.11,
            deposit: 3210.33,
            installmentSize: 0,
            installments: 0,
            remainder: 0,
            total: 3210.33,
            originalDeposit: 3210.33,
            originalInstallments: 0,
          },
          part: {
            discount: 0,
            deposit: 342.31,
            installmentSize: 722.53,
            installments: 4,
            remainder: 0.01,
            total: 3232.44,
            originalDeposit: 342.31,
            originalInstallments: 4,
          },
        },
        shipping: 83.11,
        free: false,
        discountMessage: null,
      };
      expect(priceRowToCourseResultMap(priceRow)).toEqual(courseResult);
    });

    it('should round off decimals to the appropraite precision', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 3232.436,
        multiCourseDiscountRate: 0.3963,
        deposit: 342.311,
        discount: 22.114,
        partDiscount: 0,
        installments: 3.9,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 83.113,
        order: 0,
      };

      const result = priceRowToCourseResultMap(priceRow);
      expect(result.cost).toBe(3232.44);
      expect(result.multiCourseDiscountRate).toBe(0.40);
      expect(result.plans.full.discount).toBe(22.11);
      expect(result.plans.part?.installments).toBe(4);
      expect(result.shipping).toBe(83.11);
    });

    it('should ensure the cost is at least 0', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: -323,
        multiCourseDiscountRate: 0.50,
        deposit: 100,
        discount: 50,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.cost).toBe(0);
    });

    it('should ensure the shipping is at least 0', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.50,
        deposit: 100,
        discount: 50,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: -20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.shipping).toBe(0);
    });

    it('should ensure the shipping is less than or equal to the cost', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.50,
        deposit: 100,
        partDiscount: 0,
        discount: 50,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 4800,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.shipping).toBe(900);
    });

    it('should ensure the multi-course discount rate is greater than or equal to 0', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: -1.50,
        deposit: 100,
        discount: 50,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.multiCourseDiscountRate).toBe(0);
    });

    it('should ensure the multi-course discount rate is less than or equal to 1', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 4,
        deposit: 100,
        discount: 50,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.multiCourseDiscountRate).toBe(1);
    });

    it('should ensure the full payment plan discount is greater than or equal to 0', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.5,
        deposit: 100,
        discount: -30,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.plans.full.discount).toBe(0);
    });

    it('should ensure the full payment plan discount is less than or equal to the cost minus the shipping', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.5,
        deposit: 100,
        discount: 1050,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.plans.full.discount).toBe(880);
    });

    it('should ensure the part payment plan deposit is less than or equal to part total', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.5,
        deposit: 5300,
        discount: 1050,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.plans.part?.deposit).toBe(900);
    });

    it('should ensure the part payment plan deposit is greater than or equal to 0', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.5,
        deposit: -43,
        discount: 1050,
        partDiscount: 0,
        installments: 4,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.plans.part?.deposit).toBe(0);
    });

    it('should ensure the part payment plan installments is greater than or equal to 1', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 900,
        multiCourseDiscountRate: 0.5,
        deposit: 100,
        discount: 1050,
        partDiscount: 0,
        installments: -3,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 20,
        order: 0,
      };
      const result = priceRowToCourseResultMap(priceRow);
      expect(result.plans.part?.installments).toBe(1);
    });
  });

  describe('when student is true', () => {

    beforeEach(() => {
      priceRowToCourseResultMap = getPriceRowToCourseResultMap(true);
    });

    it('should map PriceRows to CourseResult with half the number of installments', () => {
      const priceRow: PriceRow = {
        code: 'ZU-CA',
        currencyCode: 'CAD',
        cost: 3232.436,
        multiCourseDiscountRate: 0.3963,
        deposit: 342.311,
        discount: 22.114,
        partDiscount: 0,
        installments: 3.9,
        courseCode: 'ZU',
        courseName: 'Zergling Herding',
        shipping: 83.113,
        order: 0,
      };
      const courseResult: CourseResult = {
        code: 'ZU',
        name: 'Zergling Herding',
        primary: false,
        cost: 3232.44,
        multiCourseDiscountRate: 0.40,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 0,
        discountedCost: 3232.44,
        order: 0,
        plans: {
          full: {
            discount: 22.11,
            deposit: 3210.33,
            installmentSize: 0,
            installments: 0,
            remainder: 0,
            total: 3210.33,
            originalDeposit: 3210.33,
            originalInstallments: 0,
          },
          part: {
            discount: 0,
            deposit: 342.31,
            installmentSize: 1445.06,
            installments: 2,
            remainder: 0.01,
            total: 3232.44,
            originalDeposit: 342.31,
            originalInstallments: 2,
          },
        },
        shipping: 83.11,
        free: false,
        discountMessage: null,
      };
      expect(priceRowToCourseResultMap(priceRow)).toEqual(courseResult);
    });
  });
});
