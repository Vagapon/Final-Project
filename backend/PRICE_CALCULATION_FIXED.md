# 💰 Hướng Dẫn Tính Giá Booking (CỐ ĐỊNH THEO CA)

## 📊 **CÔNG THỨC TÍNH GIÁ MỚI**

```
Tổng giá = Giá sân × Hệ số ca
```

**KHÔNG** phụ thuộc vào thời gian đặt!

---

## 🕐 **HỆ SỐ CA (Multiplier)**

| Ca | Thời gian | Hệ số | Ví dụ (200,000đ cố định) |
|----|-----------|-------|--------------------------|
| **Ca Sáng** | 06:00 - 11:00 | **1.0** | 200,000 × 1.0 = **200,000đ** |
| **Ca Chiều** | 14:00 - 17:00 | **1.2** | 200,000 × 1.2 = **240,000đ** |
| **Ca Tối** | 18:00 - 22:00 | **1.5** | 200,000 × 1.5 = **300,000đ** |

---

## 📐 **VÍ DỤ TÍNH GIÁ**

### **Ví dụ 1: Đặt sân ca sáng (bất kỳ thời gian nào)**
- Giá sân: **200,000đ** (cố định)
- Time slot: **06:00 - 07:30** (1.5 giờ) HOẶC **08:00 - 10:00** (2 giờ)
- Ca: **Sáng** (multiplier = 1.0)

```
Tổng = 200,000 × 1.0 = 200,000đ
(Không quan tâm đặt 1.5h hay 2h)
```

### **Ví dụ 2: Đặt sân ca chiều**
- Giá sân: **200,000đ** (cố định)
- Time slot: **15:00 - 16:00** (1 giờ) HOẶC **14:00 - 17:00** (3 giờ)
- Ca: **Chiều** (multiplier = 1.2)

```
Tổng = 200,000 × 1.2 = 240,000đ
(Không quan tâm đặt 1h hay 3h)
```

### **Ví dụ 3: Đặt sân ca tối**
- Giá sân: **200,000đ** (cố định)
- Time slot: **20:00 - 21:30** (1.5 giờ)
- Ca: **Tối** (multiplier = 1.5)

```
Tổng = 200,000 × 1.5 = 300,000đ
```

---

## 🔧 **CÁCH TÍNH TRONG CODE**

### **Frontend - BookingPage.jsx**

```javascript
const basePrice = field?.pricePerHour || 0; // Giá cố định (không phải /giờ)
const duration = calculateDuration(); // CHỈ để hiển thị
const totalPrice = timeSlot ? (basePrice * timeSlot.multiplier) : basePrice;
// ✅ GIÁ CỐ ĐỊNH × HỆ SỐ CA (KHÔNG nhân duration)
```

### **Backend - Booking Model**

```javascript
bookingSchema.pre('save', async function(next) {
  if (this.startTime && this.endTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60 * 60);
    
    if (!this.totalPrice) {
      const field = await mongoose.model('Field').findById(this.fieldId);
      const timeSlot = await mongoose.model('TimeSlot').findById(this.timeSlotId);
      
      if (field && timeSlot) {
        const multiplier = timeSlot.multiplier || 1.0;
        // ✅ GIÁ CỐ ĐỊNH: pricePerHour × multiplier
        this.totalPrice = field.pricePerHour * multiplier;
      }
    }
  }
  next();
});
```

### **Backend - Booking Controller**

```javascript
const calculatedDuration = (endTime - startTime) / (1000 * 60 * 60);
const finalDuration = duration || calculatedDuration;

const timeSlotMultiplier = timeSlot.multiplier || 
  (timeSlot.timeType === 'ca_sang' ? 1.0 :
   timeSlot.timeType === 'ca_chieu' ? 1.2 :
   timeSlot.timeType === 'ca_toi' ? 1.5 : 1.0);

// ✅ GIÁ CỐ ĐỊNH
const finalTotalPrice = totalPrice || (field.pricePerHour * timeSlotMultiplier);
```

---

## 🧪 **TEST CASES**

### **Test 1: Ca Sáng - Đặt 1h**
```javascript
{
  pricePerHour: 200000,
  timeSlot: { startTime: "08:00", endTime: "09:00", multiplier: 1.0 },
  expected: 200000 × 1.0 = 200000
}
```

### **Test 2: Ca Sáng - Đặt 2h**
```javascript
{
  pricePerHour: 200000,
  timeSlot: { startTime: "08:00", endTime: "10:00", multiplier: 1.0 },
  expected: 200000 × 1.0 = 200000 ✅ (CÙNG GIÁ!)
}
```

### **Test 3: Ca Tối - Đặt 1.5h**
```javascript
{
  pricePerHour: 200000,
  timeSlot: { startTime: "20:00", endTime: "21:30", multiplier: 1.5 },
  expected: 200000 × 1.5 = 300000
}
```

### **Test 4: Ca Tối - Đặt 3h**
```javascript
{
  pricePerHour: 200000,
  timeSlot: { startTime: "19:00", endTime: "22:00", multiplier: 1.5 },
  expected: 200000 × 1.5 = 300000 ✅ (CÙNG GIÁ!)
}
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **1. Duration CHỈ để hiển thị**
- `duration` được tính và lưu vào DB
- Nhưng **KHÔNG** dùng để tính giá
- Chỉ dùng để show thông tin: "06:00 - 07:30 (1.5h)"

### **2. Giá sân = Giá CỐ ĐỊNH theo ca**
- `pricePerHour` là tên cũ, thực chất là **giá cố định PER CA**
- Nên đổi tên field thành `pricePerSession` hoặc `basePrice` (optional)

### **3. Multiplier là CHÍNH**
- Ca sáng: 1.0 → giá gốc
- Ca chiều: 1.2 → +20%
- Ca tối: 1.5 → +50%

### **4. QR Code Amount**
```javascript
const qrUrl = `https://qr.sepay.vn/img?amount=${booking.totalPrice}`;
// totalPrice = pricePerHour × multiplier
```

---

## 📊 **SO SÁNH CŨ vs MỚI**

### **Trước đây (SAI):**
```
Sân 200,000đ/giờ
Ca tối (20:00-21:30 = 1.5h)
→ 200,000 × 1.5h × 1.5 = 450,000đ ❌
```

### **Bây giờ (ĐÚNG):**
```
Sân 200,000đ (cố định)
Ca tối (multiplier 1.5)
→ 200,000 × 1.5 = 300,000đ ✅
```

**Duration KHÔNG ẢNH HƯỞNG GIÁ!**

---

## 🎯 **UI DISPLAY**

### **OrderSummary:**
```
Giá cơ bản: 200,000đ
Phí dịch vụ (Ca Tối) - Hệ số 1.5x: +100,000đ
─────────────────────────────────────────────
Tổng cộng: 300,000đ
```

### **Time Display:**
```
2025-10-14 - 20:00 đến 21:30 (1.5h) [Ca Tối]
```
Duration hiển thị để user biết đặt bao lâu, nhưng giá KHÔNG đổi!

---

## ✅ **SUMMARY**

| Yếu tố | Ảnh hưởng đến giá? |
|--------|-------------------|
| **Giá sân (pricePerHour)** | ✅ CÓ |
| **Hệ số ca (multiplier)** | ✅ CÓ |
| **Thời gian đặt (duration)** | ❌ KHÔNG |

**Công thức cuối cùng:**
```
Tổng = Giá sân × Hệ số ca
```

Đơn giản, rõ ràng, dễ quản lý! 🎉

