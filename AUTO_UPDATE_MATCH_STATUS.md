# Hệ Thống Tự Động Cập Nhật Trạng Thái Trận Đấu

## Tổng Quan

Hệ thống này tự động quản lý trạng thái của các trận đấu dựa trên thời gian thực tế. Thay vì phải cập nhật thủ công, hệ thống sẽ tự động chuyển đổi trạng thái từ "Sắp diễn ra" → "Đang diễn ra" → "Đã kết thúc" dựa trên thời gian thi đấu.

## Cách Hoạt Động

### 1. Tính Toán Trạng Thái (Frontend)

**Hàm `calculateMatchStatus(match)`** trong `MatchSchedule.jsx`:

```javascript
const calculateMatchStatus = (match) => {
  // Nếu đã bị hủy, giữ nguyên trạng thái
  if (match.status === 'cancelled') {
    return 'cancelled';
  }

  if (!match.matchDate) {
    return match.status || 'upcoming';
  }

  const now = new Date(); // Thời gian hiện tại
  const matchDate = new Date(match.matchDate); // Ngày thi đấu
  
  // Kết hợp ngày và giờ thi đấu
  let matchStartTime = new Date(matchDate);
  if (match.matchTime) {
    const [hours, minutes] = match.matchTime.split(':').map(Number);
    matchStartTime.setHours(hours || 0, minutes || 0, 0, 0);
  }

  // Tính thời gian kết thúc = thời gian bắt đầu + thời lượng
  const duration = match.duration || 90; // Mặc định 90 phút
  const matchEndTime = new Date(matchStartTime.getTime() + duration * 60 * 1000);

  // So sánh với thời gian hiện tại
  if (now < matchStartTime) {
    return 'upcoming'; // Chưa đến giờ bắt đầu
  } else if (now >= matchStartTime && now < matchEndTime) {
    return 'ongoing'; // Đang diễn ra
  } else {
    return 'completed'; // Đã kết thúc
  }
};
```

**Giải thích:**
- **upcoming (Sắp diễn ra)**: Thời gian hiện tại < thời gian bắt đầu trận đấu
- **ongoing (Đang diễn ra)**: Thời gian bắt đầu ≤ thời gian hiện tại < thời gian kết thúc
- **completed (Đã kết thúc)**: Thời gian hiện tại ≥ thời gian kết thúc
- **cancelled (Đã hủy)**: Trạng thái đặc biệt, không tự động thay đổi

### 2. Tự Động Cập Nhật Trạng Thái

**Hàm `updateMatchesStatus()`**:

```javascript
const updateMatchesStatus = useCallback(async () => {
  if (!selectedEventId || matches.length === 0) return;

  const matchesToUpdate = [];
  
  // Duyệt qua tất cả các trận đấu
  matches.forEach(match => {
    const calculatedStatus = calculateMatchStatus(match);
    // Chỉ cập nhật nếu trạng thái thay đổi và không phải cancelled
    if (calculatedStatus !== match.status && match.status !== 'cancelled') {
      matchesToUpdate.push({
        matchId: match._id,
        newStatus: calculatedStatus
      });
    }
  });

  // Cập nhật tất cả các trận đấu cần thay đổi
  if (matchesToUpdate.length > 0) {
    try {
      await Promise.all(
        matchesToUpdate.map(({ matchId, newStatus }) =>
          matchScheduleApi.updateSingleMatch(matchId, { status: newStatus })
        )
      );
      // Sau khi cập nhật, fetch lại danh sách
      fetchMatches();
    } catch (error) {
      console.error('Error updating match statuses:', error);
    }
  }
}, [selectedEventId, matches, fetchMatches]);
```

**Giải thích:**
- Hàm này kiểm tra tất cả các trận đấu trong danh sách
- So sánh trạng thái hiện tại trong database với trạng thái được tính toán
- Chỉ cập nhật những trận đấu có trạng thái thay đổi
- Không cập nhật các trận đấu đã bị hủy (cancelled)

### 3. Tự Động Chạy Định Kỳ

**useEffect hook**:

```javascript
useEffect(() => {
  if (!selectedEventId || matches.length === 0) return;

  // Cập nhật ngay lập tức (sau 2 giây để tránh conflict)
  const timeoutId = setTimeout(() => {
    updateMatchesStatus();
  }, 2000);

  // Thiết lập interval để cập nhật mỗi phút
  const interval = setInterval(() => {
    updateMatchesStatus();
  }, 60000); // 60 giây = 1 phút

  return () => {
    clearTimeout(timeoutId);
    clearInterval(interval);
  };
}, [selectedEventId, matches.length, updateMatchesStatus]);
```

**Giải thích:**
- Khi component được mount hoặc matches thay đổi, hệ thống sẽ:
  1. Đợi 2 giây rồi cập nhật lần đầu (để tránh conflict khi đang load dữ liệu)
  2. Sau đó tự động cập nhật mỗi 60 giây (1 phút)
- Khi component unmount, sẽ dọn dẹp timeout và interval để tránh memory leak

## Các Trạng Thái Trận Đấu

| Trạng thái | Mô tả | Màu sắc | Icon |
|------------|-------|---------|------|
| **upcoming** | Sắp diễn ra | Vàng (bg-yellow-500) | Clock |
| **ongoing** | Đang diễn ra | Đỏ (bg-red-500) | Play |
| **completed** | Đã kết thúc | Xám (bg-gray-500) | Pause |
| **cancelled** | Đã hủy | Đỏ đậm (bg-red-800) | AlertCircle |

## Tính Năng Bổ Sung

### 1. Hiển Thị Trạng Thái Thời Gian Thực

Trong giao diện, trạng thái được hiển thị dựa trên tính toán thời gian thực, không phải từ database:

```javascript
const displayStatus = calculateMatchStatus(match);
```

### 2. Cảnh Báo Cập Nhật

Nếu trạng thái hiển thị khác với trạng thái trong database, sẽ hiển thị cảnh báo:

```javascript
{displayStatus !== match.status && match.status !== 'cancelled' && (
  <div className="text-xs text-yellow-400 mt-1">
    ⚠ Đang cập nhật...
  </div>
)}
```

### 3. Lọc Theo Trạng Thái Tính Toán

Bộ lọc cũng sử dụng trạng thái được tính toán:

```javascript
const calculatedStatus = calculateMatchStatus(match);
const matchesStatus = filterStatus === 'all' || calculatedStatus === filterStatus;
```

## Lợi Ích

1. **Tự động hóa**: Không cần cập nhật thủ công trạng thái
2. **Chính xác**: Dựa trên thời gian thực tế, không phụ thuộc vào người dùng
3. **Hiệu quả**: Chỉ cập nhật khi cần thiết
4. **Trải nghiệm tốt**: Người dùng luôn thấy trạng thái chính xác

## Backend - Tự Động Cập Nhật Trạng Thái

### Hàm `autoUpdateMatchStatus()`

Hàm này được thêm vào `matchScheduleController.js` để tự động cập nhật trạng thái tất cả các trận đấu:

```javascript
const autoUpdateMatchStatus = async () => {
  try {
    const now = new Date();
    
    // Lấy tất cả các trận đấu chưa kết thúc và chưa bị hủy
    const matches = await Match.find({
      status: { $in: ['upcoming', 'ongoing'] }
    });

    let updatedCount = 0;

    for (const match of matches) {
      // Tính toán thời gian bắt đầu và kết thúc
      // ... logic tương tự như frontend ...
      
      // Cập nhật trạng thái nếu cần
      if (newStatus) {
        await Match.findByIdAndUpdate(match._id, { 
          status: newStatus,
          updatedAt: Date.now()
        });
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Lỗi khi tự động cập nhật:', error);
    return { success: false, error: error.message };
  }
};
```

### API Endpoint

**POST** `/api/event/matches/auto-update-status`

- **Quyền**: Chỉ ADMIN mới có thể gọi
- **Mục đích**: Cập nhật thủ công tất cả trận đấu (có thể dùng với cron job)
- **Response**:
```json
{
  "success": true,
  "message": "Đã cập nhật 5 trận đấu",
  "updatedCount": 5
}
```

### Thiết Lập Cron Job (Tùy chọn)

Để tự động chạy mỗi phút, có thể thêm vào `server.js`:

```javascript
const cron = require('node-cron');
const { autoUpdateMatchStatus } = require('./controllers/Event/matchScheduleController');

// Chạy mỗi phút
cron.schedule('* * * * *', async () => {
  console.log('Đang tự động cập nhật trạng thái trận đấu...');
  await autoUpdateMatchStatus();
});
```

## Lưu Ý

- Hệ thống chỉ tự động cập nhật các trận đấu từ "upcoming" → "ongoing" → "completed"
- Trận đấu "cancelled" sẽ không bị tự động thay đổi
- Frontend cập nhật mỗi phút khi người dùng đang xem trang
- Backend có thể được gọi từ cron job để đảm bảo cập nhật ngay cả khi không có người dùng
- Cần đảm bảo `matchDate`, `matchTime` và `duration` được thiết lập đúng

