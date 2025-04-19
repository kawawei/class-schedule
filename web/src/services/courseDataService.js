// 課程數據服務 Course Data Service
import { ref, computed } from 'vue';

class CourseDataService {
  constructor() {
    // 所有課程數據 All course data
    this.courses = ref([]);
  }

  // 設置課程數據 Set course data
  setCourses(coursesData) {
    this.courses.value = coursesData;
  }

  // 根據 UUID 獲取相同課程數量 Get count of courses with same UUID
  getCoursesCountByUuid(uuid) {
    return this.courses.value.filter(course => course.uuid === uuid).length;
  }

  // 根據 UUID 獲取相同課程的總費用 Get total fee of courses with same UUID
  getCoursesTotalFeeByUuid(uuid) {
    const sameCourses = this.courses.value.filter(course => course.uuid === uuid);
    return {
      courseFee: sameCourses.reduce((sum, course) => sum + (Number(course.courseFee) || 0), 0),
      teacherFee: sameCourses.reduce((sum, course) => sum + (Number(course.teacherFee) || 0), 0),
      assistantFee: sameCourses.reduce((sum, course) => sum + (Number(course.assistantFee) || 0), 0)
    };
  }

  // 根據 UUID 獲取課程系列信息 Get course series info by UUID
  getCourseSeriesInfoByUuid(uuid) {
    const sameCourses = this.courses.value.filter(course => course.uuid === uuid);
    if (sameCourses.length === 0) return null;

    return {
      count: sameCourses.length,
      totalFees: this.getCoursesTotalFeeByUuid(uuid),
      dates: sameCourses.map(course => course.date).sort(),
      firstDate: sameCourses.map(course => course.date).sort()[0],
      lastDate: sameCourses.map(course => course.date).sort().pop()
    };
  }
}

// 創建服務實例 Create service instance
const courseDataService = new CourseDataService();

export default courseDataService; 