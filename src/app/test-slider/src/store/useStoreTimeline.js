import { create } from 'zustand';

const useTimelineStore = create((set, get) => ({
  timelinesTextCruve: {
    on: {},  // Chứa các timeline có trạng thái 'on'
    off: {},  // Chứa các timeline có trạng thái 'off'
  },

  // Thêm một timeline vào store với trạng thái 'on' hoặc 'off'
  addTimeline: (key, timeline, status) => set((state) => {
    // Kiểm tra trạng thái và thêm timeline vào đúng nhóm
    if (status === 'on' || status === 'off') {
      return {
        timelinesTextCruve: {
          ...state.timelinesTextCruve,
          [status]: {
            ...state.timelinesTextCruve[status],
            [key]: timeline,  // Thêm timeline với key vào nhóm 'on' hoặc 'off'
          },
        },
      };
    }
    // Trả về nếu trạng thái không hợp lệ
    console.error('Invalid status. Use "on" or "off".');
    return state;
  }),

  // Lấy timeline theo key và trạng thái ('on' hoặc 'off')
  getTimelineByKey: (key, status) => {
    const state = get();
    return state.timelinesTextCruve[status][key];  // Trả về timeline trong nhóm 'on' hoặc 'off'
  },

  // Xóa timeline theo key và trạng thái ('on' hoặc 'off')
  removeTimelineByKey: (key, status) => set((state) => {
    const { [key]: _, ...rest } = state.timelinesTextCruve[status];  // Xóa key trong nhóm 'on' hoặc 'off'
    return {
      timelinesTextCruve: {
        ...state.timelinesTextCruve,
        [status]: rest,
      },
    };
  }),

  // Đặt lại tất cả timelines (cả 'on' và 'off')
  resetTimelines: () => set({
    timelinesTextCruve: {
      on: {},
      off: {},
    },
  }),
}));

export default useTimelineStore;
