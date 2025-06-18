/*
 * Panduan Mengubah Interval Peringatan Telegram
 * ============================================
 */

// OPSI 1: Interval lebih pendek (5 menit)
#define ALERT_COOLDOWN_MINUTES 5             

// OPSI 2: Interval lebih panjang (30 menit)  
#define ALERT_COOLDOWN_MINUTES 30            

// OPSI 3: Interval sangat pendek untuk testing (1 menit)
#define ALERT_COOLDOWN_MINUTES 1             

// OPSI 4: Nonaktifkan cooldown (alert setiap kali ada perubahan)
#define ALERT_COOLDOWN_MINUTES 0             

/*
 * REKOMENDASI BERDASARKAN KONDISI:
 * 
 * 🏠 Rumah/Area Kecil:
 * #define ALERT_COOLDOWN_MINUTES 5     // 5 menit - respon cepat
 * 
 * 🏘️ Perumahan/Komunitas:
 * #define ALERT_COOLDOWN_MINUTES 10    // 10 menit - standard
 * 
 * 🌊 Sungai Besar/Dam:
 * #define ALERT_COOLDOWN_MINUTES 15    // 15 menit - menghindari spam
 * 
 * 🧪 Testing/Development:
 * #define ALERT_COOLDOWN_MINUTES 1     // 1 menit - untuk testing
 * 
 * 🚨 Emergency Response:
 * #define ALERT_COOLDOWN_MINUTES 0     // No cooldown - alert kontinyu
 */

/*
 * LEVEL ALERT YANG DIKIRIM:
 * 
 * // Hanya CRITICAL (bahaya tinggi saja)
 * #define CRITICAL_ALERT_ONLY true     
 * 
 * // HIGH + CRITICAL (default - lebih aman)
 * #define CRITICAL_ALERT_ONLY false    
 */
