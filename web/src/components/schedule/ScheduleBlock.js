import { defineComponent, computed, ref, onMounted, inject, watch } from 'vue';
import HoverTooltip from '../base/HoverTooltip.vue';
import { scheduleAPI } from '@/utils/api';
import './ScheduleBlock.scss';
import { format } from 'date-fns';

export default defineComponent({
  name: 'ScheduleBlock',

  components: {
    HoverTooltip
  },

  props: {
    // 開始時間 Start time (HH:mm format)
    startTime: {
      type: String,
      required: true
    },
    // 結束時間 End time (HH:mm format)
    endTime: {
      type: String,
      required: true
    },
    // 課程類型 Course type
    courseType: {
      type: String,
      required: true,
      validator: (value) => {
        // 只驗證是否為非空字符串 Only validate if it's a non-empty string
        return typeof value === 'string' && value.trim().length > 0;
      }
    },
    // 補習班名稱 School name
    schoolName: {
      type: String,
      required: true
    },
    // 老師名稱 Teacher name
    teacherName: {
      type: String,
      required: true
    },
    // 助教名稱 Assistant name (optional)
    assistantName: {
      type: String,
      default: ''
    },
    // 位置信息 Position info for grid layout
    position: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.hasOwnProperty('row') && value.hasOwnProperty('column');
      }
    },
    // 課程費用 Course fee
    courseFee: {
      type: [String, Number],
      default: ''
    },
    // 教師費用 Teacher fee
    teacherFee: {
      type: [String, Number],
      default: ''
    },
    // 助教費用 Assistant fee
    assistantFee: {
      type: [String, Number],
      default: ''
    },
    // 班級名稱 Class name
    className: {
      type: [String, null],
      default: null
    },
    // 日期 Date
    date: {
      type: String,
      default: ''
    },
    // 課程 ID Course ID
    courseId: {
      type: [String, Number],
      required: true
    },
    // 課程 UUID Course UUID
    uuid: {
      type: String,
      required: false,
      default: () => Math.random().toString(36).substring(2, 15)
    },
    // 標題 Title
    title: {
      type: String,
      default: ''
    },
    // 縣市 County
    county: {
      type: String,
      default: ''
    },
    // 區域 District
    district: {
      type: String,
      default: ''
    },
    // 課程鐘點費 Course hourly rate
    hourlyRate: {
      type: [String, Number],
      default: ''
    },
    // 備註 Notes
    notes: {
      type: String,
      default: ''
    },
    // 是否為老師端（只顯示教師費）Is teacher view (show only teacher fee)
    isTeacher: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click', 'dragstart', 'dragend', 'dblclick'],

  setup(props, { emit }) {
    const blockContent = ref(null);
    const scrollContainer = ref(null);
    const tooltipData = ref(null);
    const isLoading = ref(false);
    const isHovering = ref(false);
    const isSelected = ref(false);

    // 課程類型標籤 Course type label
    const courseTypeLabel = computed(() => {
      return props.courseType;
    });

    // 方塊樣式 Block style
    const blockStyle = computed(() => ({
      gridRow: `${props.position.row} / span ${calculateRowSpan()}`,
      gridColumn: `${props.position.column}`
    }));

    // 格式化時間 Format time
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // 計算行數跨度 Calculate row span based on time difference
    const calculateRowSpan = () => {
      const start = timeToMinutes(props.startTime);
      const end = timeToMinutes(props.endTime);
      return Math.ceil((end - start) / 30); // 每30分鐘一個格子
    };

    // 將時間轉換為分鐘數 Convert time to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // 點擊方塊處理函數 Click handler
    const handleBlockClick = () => {
      // 切換選中狀態 Toggle selected state
      isSelected.value = !isSelected.value;
      
      // 觸發點擊事件並傳遞課程數據 Emit click event with course data
      emit('click', {
        id: props.courseId,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        courseType: props.courseType,
        schoolName: props.schoolName,
        className: props.className,
        teacherName: props.teacherName,
        assistantName: props.assistantName,
        courseFee: props.courseFee,
        teacherFee: props.teacherFee,
        assistantFee: props.assistantFee,
        uuid: props.uuid,
        county: props.county,
        district: props.district,
        isSelected: isSelected.value
      });
    };

    // 雙擊方塊處理函數 Double click handler
    const handleBlockDoubleClick = () => {
      // 觸發雙擊事件並傳遞課程數據 Emit double click event with course data
      emit('dblclick', {
        id: props.courseId,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        courseType: props.courseType,
        schoolName: props.schoolName,
        className: props.className,
        teacherName: props.teacherName,
        assistantName: props.assistantName,
        courseFee: props.courseFee,
        teacherFee: props.teacherFee,
        assistantFee: props.assistantFee,
        uuid: props.uuid,
        county: props.county,
        district: props.district
      });
    };

    // 拖曳開始 Drag start handler
    const handleDragStart = (event) => {
      // 設置拖曳數據 Set drag data
      event.dataTransfer.setData('text/plain', JSON.stringify({
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        courseType: props.courseType,
        schoolName: props.schoolName,
        className: props.className,
        teacherName: props.teacherName,
        assistantName: props.assistantName,
        courseFee: props.courseFee,
        teacherFee: props.teacherFee,
        assistantFee: props.assistantFee,
        county: props.county,
        district: props.district
      }));
      
      // 設置拖曳效果 Set drag effect
      event.dataTransfer.effectAllowed = 'move';
      
      // 觸發拖曳開始事件 Emit drag start event
      emit('dragstart', {
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date
      });
    };

    // 拖曳結束 Drag end handler
    const handleDragEnd = (event) => {
      // 觸發拖曳結束事件 Emit drag end event
      emit('dragend', {
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date
      });
    };

    // 截斷文字函數 Truncate text function
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.slice(0, length);
    };

    // 添加滾動功能 Add scrolling functionality
    onMounted(() => {
      if (scrollContainer.value) {
        let isScrolling = false;
        let startX = 0;
        let scrollLeft = 0;

        scrollContainer.value.addEventListener('mousedown', (e) => {
          isScrolling = true;
          startX = e.pageX - scrollContainer.value.offsetLeft;
          scrollLeft = scrollContainer.value.scrollLeft;
        });

        scrollContainer.value.addEventListener('mouseleave', () => {
          isScrolling = false;
        });

        scrollContainer.value.addEventListener('mouseup', () => {
          isScrolling = false;
        });

        scrollContainer.value.addEventListener('mousemove', (e) => {
          if (!isScrolling) return;
          e.preventDefault();
          const x = e.pageX - scrollContainer.value.offsetLeft;
          const walk = (x - startX) * 2;
          scrollContainer.value.scrollLeft = scrollLeft - walk;
        });

        // 保留滾輪滾動
        scrollContainer.value.addEventListener('wheel', (e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            scrollContainer.value.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }
    });

    // 注入課程數據服務 Inject course data service
    const courseDataService = inject('courseDataService');

    // 獲取課程系列信息 Get course series info
    const seriesInfo = computed(() => {
      if (!props.uuid || !courseDataService) return null;
      const info = courseDataService.getCourseSeriesInfoByUuid(props.uuid);
      if (!info) return null;
      // 格式化日期 Format date
      let firstDate = info.firstDate;
      let lastDate = info.lastDate;
      if (firstDate) firstDate = format(new Date(firstDate), 'yyyy/MM/dd');
      if (lastDate) lastDate = format(new Date(lastDate), 'yyyy/MM/dd');
      return {
        ...info,
        firstDate,
        lastDate
      };
    });

    // 格式化貨幣 Format currency
    const formatCurrency = (value) => {
      if (!value) return '0';
      return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    // 獲取課程詳情 Get course details
    const fetchCourseDetails = async () => {
      if (!props.courseId) return;
      
      try {
        isLoading.value = true;
        const response = await scheduleAPI.getSchedule(props.courseId);
        
        if (response.success) {
          const courseData = response.data;
          tooltipData.value = {
            id: courseData.id,
            courseType: courseData.course_type || props.courseType,
            schoolName: courseData.school_name || props.schoolName,
            className: courseData.class_name || props.className,
            teacherName: courseData.teacher?.name || props.teacherName,
            assistantName: courseData.assistants?.[0]?.assistant_id || props.assistantName,
            startTime: courseData.start_time || props.startTime,
            endTime: courseData.end_time || props.endTime,
            date: courseData.date || props.date,
            courseFee: courseData.course_fee || props.courseFee,
            teacherFee: courseData.teacher_fee || props.teacherFee,
            assistantFee: courseData.assistants?.[0]?.fee || props.assistantFee,
            county: courseData.county || props.county,
            district: courseData.district || props.district,
            notes: courseData.notes || props.notes,
            hourlyRate: courseData.hourly_rate || props.hourlyRate,
            teacher: courseData.teacher,
            assistants: courseData.assistants || [],
            series_id: courseData.series_id
          };
        } else {
          // 如果 API 請求失敗，使用 props 中的數據
          // If API request fails, use data from props
          tooltipData.value = {
            id: props.courseId,
            courseType: props.courseType,
            schoolName: props.schoolName,
            className: props.className,
            teacherName: props.teacherName,
            assistantName: props.assistantName,
            startTime: props.startTime,
            endTime: props.endTime,
            date: props.date,
            courseFee: props.courseFee,
            teacherFee: props.teacherFee,
            assistantFee: props.assistantFee,
            county: props.county,
            district: props.district,
            notes: props.notes,
            hourlyRate: props.hourlyRate,
            teacher: null,
            assistants: [],
            series_id: null
          };
        }
      } catch (error) {
        console.error('獲取課程詳情失敗:', error);
        // 發生錯誤時也使用 props 中的數據
        // Use data from props when error occurs
        tooltipData.value = {
          id: props.courseId,
          courseType: props.courseType,
          schoolName: props.schoolName,
          className: props.className,
          teacherName: props.teacherName,
          assistantName: props.assistantName,
          startTime: props.startTime,
          endTime: props.endTime,
          date: props.date,
          courseFee: props.courseFee,
          teacherFee: props.teacherFee,
          assistantFee: props.assistantFee,
          county: props.county,
          district: props.district,
          notes: props.notes,
          hourlyRate: props.hourlyRate,
          teacher: null,
          assistants: [],
          series_id: null
        };
      } finally {
        isLoading.value = false;
      }
    };

    // 監聽懸浮狀態變化 Watch hovering state changes
    watch(isHovering, (newValue) => {
      if (newValue) {
        fetchCourseDetails();
      } else {
        tooltipData.value = null;
      }
    });

    return {
      blockContent,
      scrollContainer,
      tooltipData,
      isLoading,
      isHovering,
      truncateText,
      courseTypeLabel,
      blockStyle,
      formatTime,
      handleBlockClick,
      handleDragStart,
      handleDragEnd,
      // 直接暴露所有需要的 props 給模板使用
      ...props,
      seriesInfo,
      formatCurrency,
      isSelected,
      handleBlockDoubleClick
    };
  }
}); 