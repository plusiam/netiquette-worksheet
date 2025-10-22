import React, { useState, useRef } from 'react';
import { AlertCircle, Share2, Heart, Printer, BookOpen, Download, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PosterMaker from './PosterMaker';

export default function NetiquetteWorksheet() {
  const [currentStep, setCurrentStep] = useState(1); // 1: 학습지, 2: 포스터 제작
  const [studentInfo, setStudentInfo] = useState({
    school: '',
    grade: '',
    class: '',
    name: ''
  });

  const [answers, setAnswers] = useState({
    hateDefinition: '',
    hateExample: '',
    hateExampleMeaning: '',
    hateProblem: '',
    fakeNewsDefinition: '',
    fakeNewsExample: '',
    fakeNewsSource: '',
    fakeNewsPrevention: '',
    posterTopic: '',
    posterPlan: ''
  });

  const worksheetRef = useRef(null);

  const handleStudentInfoChange = (field, value) => {
    setStudentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  // 초기화 함수
  const handleReset = () => {
    const confirmReset = window.confirm(
      '정말로 새로 시작하시겠습니까?\n\n작성한 모든 내용이 삭제됩니다. 이 작업은 취소할 수 없습니다.'
    );
    
    if (confirmReset) {
      setStudentInfo({
        school: '',
        grade: '',
        class: '',
        name: ''
      });
      setAnswers({
        hateDefinition: '',
        hateExample: '',
        hateExampleMeaning: '',
        hateProblem: '',
        fakeNewsDefinition: '',
        fakeNewsExample: '',
        fakeNewsSource: '',
        fakeNewsPrevention: '',
        posterTopic: '',
        posterPlan: ''
      });
      setCurrentStep(1);
      
      // 페이지 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 학습지 완성도 체크
  const isWorksheetComplete = () => {
    const requiredFields = [
      'hateDefinition',
      'hateExample', 
      'hateExampleMeaning',
      'hateProblem',
      'fakeNewsDefinition',
      'fakeNewsExample',
      'fakeNewsSource',
      'fakeNewsPrevention'
    ];
    
    return requiredFields.every(field => answers[field]?.trim().length > 0);
  };

  // 포스터 기획 완성도 체크
  const isPosterPlanComplete = () => {
    return answers.posterTopic && answers.posterPlan?.trim().length > 0;
  };

  // 학습지 PDF 다운로드
  const downloadWorksheetPDF = async () => {
    if (!worksheetRef.current) return;

    const buttons = worksheetRef.current.querySelectorAll('.action-button');
    buttons.forEach(btn => btn.style.display = 'none');

    try {
      const canvas = await html2canvas(worksheetRef.current, {
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
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const studentName = studentInfo.name || '학생';
      pdf.save(`네티켓_학습지_${studentName}.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      buttons.forEach(btn => btn.style.display = '');
    }
  };

  // 학습지 PNG 다운로드
  const downloadWorksheetPNG = async () => {
    if (!worksheetRef.current) return;

    const buttons = worksheetRef.current.querySelectorAll('.action-button');
    buttons.forEach(btn => btn.style.display = 'none');

    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      const studentName = studentInfo.name || '학생';
      link.download = `네티켓_학습지_${studentName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('PNG 생성 오류:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      buttons.forEach(btn => btn.style.display = '');
    }
  };

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
              >
                ← 학습지로 돌아가기
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                title="새로 시작하기"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">새로 시작</span>
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-purple-600" />
              네티켓 지킴이 포스터 만들기
            </h1>
            <p className="text-gray-600 mt-2">
              {studentInfo.name ? `${studentInfo.name} 학생` : '학생'}의 창의적인 포스터를 만들어보세요!
            </p>
          </div>

          <PosterMaker 
            topic={answers.posterTopic || '네티켓'}
            plan={answers.posterPlan}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="font-semibold">학습지 작성</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="font-semibold">포스터 제작</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isWorksheetComplete() && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">학습지 완성!</span>
                </div>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                title="모든 내용을 지우고 새로 시작합니다"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">새로 시작</span>
              </button>
            </div>
          </div>
        </div>

        <div ref={worksheetRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <BookOpen className="w-10 h-10" />
                  도덕_네티켓
                </h1>
                <p className="text-xl opacity-90">혐오표현, 가짜뉴스 멈춰!</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-20 bg-black rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-24 bg-red-500 rotate-45 absolute"></div>
                  <div className="w-1 h-24 bg-red-500 -rotate-45 absolute"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-b-4 border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="초등학교"
                value={studentInfo.school}
                onChange={(e) => handleStudentInfoChange('school', e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="학년"
                value={studentInfo.grade}
                onChange={(e) => handleStudentInfoChange('grade', e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="반"
                value={studentInfo.class}
                onChange={(e) => handleStudentInfoChange('class', e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="이름"
                value={studentInfo.name}
                onChange={(e) => handleStudentInfoChange('name', e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-8 space-y-8">
            <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-500 rounded-full p-4">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">혐오표현이란 무엇인가요?</h2>
                  <div className="flex items-center gap-2 text-red-600">
                    <Heart className="w-5 h-5" />
                    <Share2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <textarea
                value={answers.hateDefinition}
                onChange={(e) => handleAnswerChange('hateDefinition', e.target.value)}
                placeholder="혐오표현의 정의를 써보세요..."
                className="w-full p-4 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none min-h-[100px] transition-colors"
              />
            </section>

            <section className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                혐오표현의 예시를 찾아보고, 그 뜻이 무엇인지 찾아 써보세요.
              </h3>
              
              <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-yellow-400">
                <p className="text-sm text-gray-600 mb-2">💡 예시 설명:</p>
                <p className="text-sm text-gray-700">
                  '맘충'은 '엄마(mom)'와 '벌레(충)'를 합친 신조어로, 주로 공공장소에서 예의 없이 행동하거나 타인에게 불편을 주는 일부 엄마들을 비하하는 의미
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={answers.hateExample}
                  onChange={(e) => handleAnswerChange('hateExample', e.target.value)}
                  placeholder="찾은 혐오표현 예시를 써보세요..."
                  className="w-full p-4 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors"
                />
                
                <textarea
                  value={answers.hateExampleMeaning}
                  onChange={(e) => handleAnswerChange('hateExampleMeaning', e.target.value)}
                  placeholder="그 혐오표현이 어떤 의미인지 설명해보세요..."
                  className="w-full p-4 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none min-h-[120px] transition-colors"
                />
              </div>
            </section>

            <section className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                혐오표현을 쓰면 어떤 문제가 일어날까요?
              </h3>
              
              <textarea
                value={answers.hateProblem}
                onChange={(e) => handleAnswerChange('hateProblem', e.target.value)}
                placeholder="혐오표현의 문제점을 생각해서 써보세요..."
                className="w-full p-4 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none min-h-[120px] transition-colors"
              />
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mt-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-500 rounded-lg p-4">
                  <div className="w-16 h-12 bg-white rounded flex items-center justify-center relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-red-500 border-t-6 border-t-transparent border-b-6 border-b-transparent"></div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded absolute -bottom-2 -right-2">FAKE</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">가짜뉴스란 무엇인가요?</h2>
                </div>
              </div>
              
              <textarea
                value={answers.fakeNewsDefinition}
                onChange={(e) => handleAnswerChange('fakeNewsDefinition', e.target.value)}
                placeholder="가짜뉴스의 정의를 써보세요..."
                className="w-full p-4 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[100px] transition-colors"
              />
            </section>

            <section className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                가짜 뉴스의 사례에는 어떤 것이 있는지 하나만 찾아보세요. (출처 쓰기)
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={answers.fakeNewsExample}
                  onChange={(e) => handleAnswerChange('fakeNewsExample', e.target.value)}
                  placeholder="찾은 가짜뉴스 사례를 써보세요..."
                  className="w-full p-4 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none min-h-[100px] transition-colors"
                />
                
                <input
                  type="text"
                  value={answers.fakeNewsSource}
                  onChange={(e) => handleAnswerChange('fakeNewsSource', e.target.value)}
                  placeholder="출처를 써보세요 (예: 팩트체크 사이트, 뉴스 기사 등)"
                  className="w-full p-4 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </section>

            <section className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                가짜 뉴스를 예방하기 위해서 어떻게 해야 할까요?
              </h3>
              
              <textarea
                value={answers.fakeNewsPrevention}
                onChange={(e) => handleAnswerChange('fakeNewsPrevention', e.target.value)}
                placeholder="가짜뉴스를 예방하는 방법을 생각해서 써보세요..."
                className="w-full p-4 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none min-h-[120px] transition-colors"
              />
            </section>

            <section className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎨 네티켓 지킴이 포스터 기획하기
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                어떤 포스터를 만들지 계획해 보세요! (다음 단계에서 실제로 만들어볼 수 있어요)
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    포스터 주제 선택
                  </label>
                  <select
                    value={answers.posterTopic}
                    onChange={(e) => handleAnswerChange('posterTopic', e.target.value)}
                    className="w-full p-4 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
                  >
                    <option value="">주제를 선택하세요</option>
                    <option value="혐오표현">혐오표현</option>
                    <option value="가짜뉴스">가짜뉴스</option>
                    <option value="둘 다">혐오표현 + 가짜뉴스</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    포스터 기획안
                  </label>
                  <textarea
                    value={answers.posterPlan}
                    onChange={(e) => handleAnswerChange('posterPlan', e.target.value)}
                    placeholder="어떤 내용을 포스터에 넣을지, 어떤 그림이나 글을 사용할지 자유롭게 계획해보세요..."
                    className="w-full p-4 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none min-h-[150px] transition-colors"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gray-50 p-6 border-t-2 border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center action-button">
              <button
                onClick={downloadWorksheetPNG}
                disabled={!isWorksheetComplete()}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                  isWorksheetComplete()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                학습지 PNG 다운로드
              </button>
              
              <button
                onClick={downloadWorksheetPDF}
                disabled={!isWorksheetComplete()}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                  isWorksheetComplete()
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                학습지 PDF 다운로드
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Printer className="w-5 h-5" />
                인쇄하기
              </button>
            </div>

            {isPosterPlanComplete() && (
              <div className="action-button">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  <ChevronRight className="w-6 h-6" />
                  포스터 만들러 가기
                </button>
              </div>
            )}

            {!isWorksheetComplete() && (
              <p className="text-center text-sm text-gray-500">
                💡 모든 질문에 답변을 작성하면 학습지를 다운로드할 수 있습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .action-button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
