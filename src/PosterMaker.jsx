import React, { useState, useRef } from 'react';
import { Download, Image as ImageIcon, Trash2, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// 스티커 이모지 목록
const STICKERS = ['😊', '👍', '❤️', '⭐', '🎉', '💡', '✅', '🚫', '⚠️', '📢'];

// 템플릿 데이터
const TEMPLATES = {
  simple: {
    name: '심플형',
    bgColor: 'from-blue-400 to-blue-600',
    accentColor: 'bg-blue-100',
    textColor: 'text-blue-900'
  },
  cartoon: {
    name: '카툰형',
    bgColor: 'from-orange-400 to-pink-500',
    accentColor: 'bg-orange-100',
    textColor: 'text-orange-900'
  },
  infographic: {
    name: '인포그래픽형',
    bgColor: 'from-green-400 to-teal-600',
    accentColor: 'bg-green-100',
    textColor: 'text-green-900'
  }
};

export default function PosterMaker({ topic = '네티켓', plan = '' }) {
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  const [posterData, setPosterData] = useState({
    title: `${topic} 지키기`,
    subtitle: '함께 만드는 건강한 인터넷 문화',
    message: plan || '서로 존중하고 배려하는 네티켓을 실천해요!'
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [stickers, setStickers] = useState([]);
  const posterRef = useRef(null);
  const fileInputRef = useRef(null);

  // 포스터 초기화
  const handleReset = () => {
    const confirmReset = window.confirm(
      '포스터를 초기화하시겠습니까?\n\n작성한 모든 내용이 삭제됩니다. 이 작업은 취소할 수 없습니다.'
    );
    
    if (confirmReset) {
      setSelectedTemplate('simple');
      setPosterData({
        title: `${topic} 지키기`,
        subtitle: '함께 만드는 건강한 인터넷 문화',
        message: plan || '서로 존중하고 배려하는 네티켓을 실천해요!'
      });
      setUploadedImage(null);
      setStickers([]);
      
      // 페이지 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now(),
      emoji,
      x: 50,
      y: 50,
      size: 40
    };
    setStickers([...stickers, newSticker]);
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const updateSticker = (id, updates) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // PNG 다운로드
  const downloadPNG = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `네티켓_포스터_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('PNG 생성 오류:', error);
      alert('이미지 생성에 실패했습니다.');
    }
  };

  // PDF 다운로드
  const downloadPDF = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`네티켓_포스터_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  const template = TEMPLATES[selectedTemplate];

  return (
    <div className="space-y-6">
      {/* 상단 초기화 버튼 */}
      <div className="bg-white rounded-xl shadow-lg p-4 flex justify-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
          title="포스터 초기화"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">포스터 초기화</span>
        </button>
      </div>

      {/* 템플릿 선택 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">1. 템플릿 선택</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTemplate === key
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className={`h-20 rounded bg-gradient-to-br ${tmpl.bgColor} mb-2`}></div>
              <p className="font-semibold text-gray-800">{tmpl.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 내용 입력 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">2. 포스터 내용 입력</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={posterData.title}
              onChange={(e) => setPosterData({ ...posterData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="포스터 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              부제목
            </label>
            <input
              type="text"
              value={posterData.subtitle}
              onChange={(e) => setPosterData({ ...posterData, subtitle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="부제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              핵심 메시지
            </label>
            <textarea
              value={posterData.message}
              onChange={(e) => setPosterData({ ...posterData, message: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none min-h-[100px]"
              placeholder="포스터에 들어갈 핵심 메시지를 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 이미지 업로드 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">3. 이미지 추가 (선택)</h2>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/jpeg,image/png"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          <ImageIcon className="w-5 h-5" />
          이미지 업로드 (JPG, PNG / 최대 5MB)
        </button>
        {uploadedImage && (
          <div className="mt-4 relative inline-block">
            <img src={uploadedImage} alt="Uploaded" className="max-w-xs rounded-lg" />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 스티커 추가 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">4. 스티커 추가 (선택)</h2>
        <div className="flex flex-wrap gap-2">
          {STICKERS.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => addSticker(emoji)}
              className="text-3xl p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
        {stickers.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            💡 추가된 스티커: {stickers.length}개 (포스터에서 드래그하여 위치 조정)
          </p>
        )}
      </div>

      {/* 포스터 미리보기 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">5. 미리보기 및 다운로드</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadPNG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* 포스터 */}
        <div className="flex justify-center">
          <div
            ref={posterRef}
            className={`w-full max-w-2xl aspect-[3/4] bg-gradient-to-br ${template.bgColor} rounded-2xl shadow-2xl p-8 relative overflow-hidden`}
          >
            {/* 배경 장식 */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full"></div>
            </div>

            {/* 콘텐츠 */}
            <div className="relative z-10 h-full flex flex-col">
              {/* 제목 */}
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {posterData.title}
                </h1>
                <p className="text-2xl text-white opacity-90 drop-shadow">
                  {posterData.subtitle}
                </p>
              </div>

              {/* 이미지 */}
              {uploadedImage && (
                <div className="flex justify-center mb-6">
                  <img
                    src={uploadedImage}
                    alt="Poster"
                    className="max-h-64 rounded-lg shadow-xl"
                  />
                </div>
              )}

              {/* 메시지 */}
              <div className={`${template.accentColor} rounded-xl p-6 flex-1 flex items-center justify-center`}>
                <p className={`text-xl ${template.textColor} font-semibold text-center leading-relaxed whitespace-pre-wrap`}>
                  {posterData.message}
                </p>
              </div>

              {/* 스티커 */}
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute cursor-move group"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    fontSize: `${sticker.size}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  draggable
                  onDragEnd={(e) => {
                    const rect = posterRef.current.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    updateSticker(sticker.id, { x, y });
                  }}
                >
                  {sticker.emoji}
                  <button
                    onClick={() => removeSticker(sticker.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          💡 스티커를 드래그하여 위치를 조정할 수 있습니다
        </p>
      </div>
    </div>
  );
}
