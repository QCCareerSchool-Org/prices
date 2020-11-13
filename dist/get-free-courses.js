"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFreeCourses = void 0;
const prices_1 = require("./prices");
/**
 * Determines which courses should be free
 * @param courses the selected courses
 * @param options the price query options
 */
exports.getFreeCourses = (priceRows, options) => {
    const freeCourses = [];
    // MMFreeMW option
    if ((options === null || options === void 0 ? void 0 : options.MMFreeMW) === true) {
        if (priceRows.some(p => p.code === 'MM') || priceRows.some(p => p.code === 'MZ')) {
            freeCourses.push('MW');
        }
    }
    // pet school promotion
    if (priceRows.some(p => p.code === 'DG')) {
        freeCourses.push('FA');
    }
    if ((options === null || options === void 0 ? void 0 : options.school) === 'QC Event School') {
        if (options === null || options === void 0 ? void 0 : options.discountAll) {
            // promotion for returning students--get VE free with any other event course
            if (priceRows.filter(p => prices_1.eventCourse(p.code) && p.code !== 'VE').length) {
                freeCourses.push('VE');
            }
        }
        else {
            // promotion for new students---buy any foundation course and get up to two advanced or specialty courses free
            const foundationEventCoursesCount = priceRows
                .filter(p => prices_1.eventFoundationCourse(p.code)) // filter to just foundation courses
                .length;
            if (foundationEventCoursesCount >= 1) {
                const eventAdvancedCourses = priceRows
                    .filter(p => prices_1.eventAdvancedCourse(p.code)) // filter to just advanced and specialty event courses, excluding VE
                    .sort((a, b) => a.cost - b.cost) // sort cheapest to most expensive
                    .map(p => p.code); // map to just the course code
                if (eventAdvancedCourses.length >= 1) {
                    freeCourses.push(eventAdvancedCourses[0]);
                }
                if (eventAdvancedCourses.length >= 2) {
                    freeCourses.push(eventAdvancedCourses[1]);
                }
            }
        }
    }
    if ((options === null || options === void 0 ? void 0 : options.school) === 'QC Design School') {
        if (options === null || options === void 0 ? void 0 : options.discountAll) {
            // promotion for returning students---get VD free with any other course
            const courses = priceRows
                .filter(p => prices_1.designCourse(p.code) && p.code !== 'VD') // filter to just design courses, excluding VD
                .sort((a, b) => a.cost - b.cost) // sort cheapest to most expensive
                .map(p => p.code); // map to just course code
            if (courses.length >= 1) {
                freeCourses.push('VD');
            }
        }
        else {
            // promotion for new students---buy one get one of equal or lesser value free
            const courses = priceRows
                .filter(p => prices_1.designCourse(p.code)) // filter to just design courses
                .sort((a, b) => a.cost - b.cost) // sort cheapest to most expensive
                .map(p => p.code); // map to just course code
            if (courses.length >= 2) {
                freeCourses.push(courses[0]);
            }
        }
    }
    // makeup school promotion
    // no free courses
    return freeCourses;
};
