import React, { useState, useEffect } from 'react';

const CITIES = [
  { id: 'hn', name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { id: 'hp', name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { id: 'hue', name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { id: 'dn', name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { id: 'nt', name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { id: 'dl', name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { id: 'ct', name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
];

const layThongTinThoiTiet = (code) => {
  if (code === 0) return { text: 'Trời quang', icon: '☀️', bgColor: 'bg-sky-100' };
  if (code === 1 || code === 2 || code === 3) return { text: 'Có mây', icon: '☁️', bgColor: 'bg-gray-100' };
  if (code >= 45 && code <= 48) return { text: 'Sương mù', icon: '🌫️', bgColor: 'bg-gray-300' };
  if (code >= 51 && code <= 67) return { text: 'Mưa', icon: '🌧️', bgColor: 'bg-blue-200' };
  if (code >= 71 && code <= 77) return { text: 'Tuyết', icon: '❄️', bgColor: 'bg-blue-50' };
  if (code >= 80 && code <= 82) return { text: 'Mưa rào', icon: '🌦️', bgColor: 'bg-indigo-200' };
  if (code >= 95) return { text: 'Dông sét', icon: '⛈️', bgColor: 'bg-gray-400' };
  return { text: 'Không rõ', icon: '❓', bgColor: 'bg-white' };
};

const xoaDau = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

function App() {
  const [thanhPhoChon, setThanhPhoChon] = useState(null);
  const [duLieuThoiTiet, setDuLieuThoiTiet] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState('');
  
  const [donVi, setDonVi] = useState('C');
  const [tuKhoa, setTuKhoa] = useState('');
  const [dsYeuThich, setDsYeuThich] = useState(() => {
    const luu = localStorage.getItem('yeu_thich');
    return luu ? JSON.parse(luu) : [];
  });

  useEffect(() => {
    localStorage.setItem('yeu_thich', JSON.stringify(dsYeuThich));
  }, [dsYeuThich]);

  const layDuLieuApi = async (city) => {
    setDangTai(true);
    setLoi('');
    setDuLieuThoiTiet(null);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Lỗi không lấy được dữ liệu');
      
      const data = await res.json();
      setDuLieuThoiTiet(data);
    } catch (err) {
      setLoi('Đã xảy ra lỗi khi tải dữ liệu thời tiết!');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    if (thanhPhoChon) {
      layDuLieuApi(thanhPhoChon);
    }
  }, [thanhPhoChon]);

  const hienThiNhietDo = (doC) => {
    if (donVi === 'C') return Math.round(doC);
    return Math.round((doC * 9) / 5 + 32);
  };

  const xuLyYeuThich = (id, e) => {
    e.stopPropagation();
    if (dsYeuThich.includes(id)) {
      setDsYeuThich(dsYeuThich.filter(item => item !== id));
    } else {
      setDsYeuThich([...dsYeuThich, id]);
    }
  };

  const danhSachLoc = CITIES.filter(c => 
    xoaDau(c.name).includes(xoaDau(tuKhoa))
  );

  const mauNen = duLieuThoiTiet 
    ? layThongTinThoiTiet(duLieuThoiTiet.current.weather_code).bgColor 
    : 'bg-white';

  return (
    <div className={`min-h-screen ${mauNen} transition-colors duration-300 p-4 font-sans`}>
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm">
        
        <div className="border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dự Báo Thời Tiết VN</h1>
            <p className="text-gray-500 text-sm">Bài tập thực hành 02 (TH01)</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập tên thành phố..." 
              className="border border-gray-300 rounded px-3 py-1 outline-none focus:border-blue-500"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <button 
              className={`px-3 py-1 border rounded ${donVi === 'C' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setDonVi('C')}
            >
              °C
            </button>
            <button 
              className={`px-3 py-1 border rounded ${donVi === 'F' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setDonVi('F')}
            >
              °F
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/3 border-r border-gray-200 p-4">
            <h2 className="font-bold text-lg mb-3">Chọn thành phố</h2>
            {danhSachLoc.length === 0 && <p className="text-red-500 text-sm">Không tìm thấy!</p>}
            
            <div className="flex flex-col gap-2">
              {danhSachLoc.map(city => {
                const dangChon = thanhPhoChon?.id === city.id;
                const daThich = dsYeuThich.includes(city.id);
                
                return (
                  <div 
                    key={city.id}
                    onClick={() => setThanhPhoChon(city)}
                    className={`flex justify-between items-center p-3 border rounded cursor-pointer ${
                      dangChon ? 'bg-blue-100 border-blue-400 font-bold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{city.name}</span>
                    <span 
                      onClick={(e) => xuLyYeuThich(city.id, e)}
                      className={`text-xl ${daThich ? 'text-yellow-500' : 'text-gray-300'} hover:scale-110`}
                    >
                      ★
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-4">
            
            {!thanhPhoChon && !dangTai && !loi && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <span className="text-4xl mb-2">☁️</span>
                <p>Vui lòng chọn thành phố bên trái</p>
              </div>
            )}

            {dangTai && (
              <div className="text-center py-20 text-blue-500">
                <p>Đang tải dữ liệu...</p>
              </div>
            )}

            {loi && (
              <div className="text-center py-20">
                <p className="text-red-500 mb-4">{loi}</p>
                <button 
                  onClick={() => layDuLieuApi(thanhPhoChon)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!dangTai && !loi && duLieuThoiTiet && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-1">{thanhPhoChon.name}</h2>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Cập nhật: {new Date(duLieuThoiTiet.current.time).toLocaleString('vi-VN')}
                </p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8 border border-gray-200 rounded-lg p-6 bg-white/50">
                  <div className="text-6xl">
                    {layThongTinThoiTiet(duLieuThoiTiet.current.weather_code).icon}
                  </div>
                  <div>
                    <p className="text-5xl font-bold">
                      {hienThiNhietDo(duLieuThoiTiet.current.temperature_2m)}°{donVi}
                    </p>
                    <p className="text-xl text-gray-600 mt-2">
                      {layThongTinThoiTiet(duLieuThoiTiet.current.weather_code).text}
                    </p>
                  </div>
                  <div className="border-l border-gray-300 pl-6 space-y-2">
                    <p>💧 Độ ẩm: <b>{duLieuThoiTiet.current.relative_humidity_2m}%</b></p>
                    <p>💨 Gió: <b>{duLieuThoiTiet.current.wind_speed_10m} km/h</b></p>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-3">Dự báo 7 ngày</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {duLieuThoiTiet.daily.time.map((ngay, index) => {
                    const objNgay = new Date(ngay);
                    const thu = objNgay.toLocaleDateString('vi-VN', { weekday: 'short' });
                    const ngayThang = objNgay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    
                    const max = duLieuThoiTiet.daily.temperature_2m_max[index];
                    const min = duLieuThoiTiet.daily.temperature_2m_min[index];
                    const maThoiTiet = duLieuThoiTiet.daily.weather_code[index];
                    const thongTin = layThongTinThoiTiet(maThoiTiet);

                    return (
                      <div key={ngay} className="border border-gray-200 rounded p-2 flex flex-col items-center bg-gray-50">
                        <span className="font-bold">{index === 0 ? 'Hôm nay' : thu}</span>
                        <span className="text-xs text-gray-500 mb-2">{ngayThang}</span>
                        <span className="text-3xl mb-2">{thongTin.icon}</span>
                        <div className="text-sm">
                          <span className="text-red-500 font-bold">{hienThiNhietDo(max)}°</span>
                          <span className="mx-1">-</span>
                          <span className="text-blue-500">{hienThiNhietDo(min)}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;