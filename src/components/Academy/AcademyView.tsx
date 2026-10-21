import React, { useState } from 'react';
import { ACADEMY_MODULES, QUIZ_QUESTIONS } from '../../data/academyData';
import { Lesson, QuizQuestion } from '../../types/trading';
import { useLanguage } from '../../context/LanguageContext';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'LESSONS' | 'QUIZ'>('LESSONS');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(ACADEMY_MODULES[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    ACADEMY_MODULES[0].lessons[0].id
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(['lesson-1-1'])
  );

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // Find active module & lesson
  const activeModule =
    ACADEMY_MODULES.find((m) => m.id === selectedModuleId) || ACADEMY_MODULES[0];
  const activeLesson =
    activeModule.lessons.find((l) => l.id === selectedLessonId) || activeModule.lessons[0];

  // Calculate total lessons and completion percentage
  const allLessons = ACADEMY_MODULES.flatMap((m) => m.lessons);
  const totalLessonsCount = allLessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = Math.round((completedCount / totalLessonsCount) * 100);

  // Toggle lesson completed
  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    // mark current as completed
    toggleLessonCompleted(activeLesson.id);

    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      setSelectedModuleId(next.moduleId);
      setSelectedLessonId(next.id);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      setSelectedModuleId(prev.moduleId);
      setSelectedLessonId(prev.id);
    }
  };

  // Quiz handlers
  const handleSelectQuizOption = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizCompleted(false);
  };

  const currentQuestion = QUIZ_QUESTIONS[currentQuizIndex];

  // Language conditional texts
  const isBn = language === 'bn';
  const lessonTitle = isBn ? activeLesson.titleBn : activeLesson.title;
  const lessonSummary = isBn ? activeLesson.summaryBn : activeLesson.summary;
  const lessonContent = isBn ? activeLesson.contentBn : (activeLesson.content || activeLesson.contentBn);
  const lessonKeyTakeaways = isBn
    ? (activeLesson.keyTakeawaysBn || activeLesson.keyTakeaways)
    : activeLesson.keyTakeaways;

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Academy Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#0f172a] border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>{t('academyTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('academySubtitle')}</p>
        </div>

        {/* Mode Switch: Lessons vs Skill Quiz */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('LESSONS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'LESSONS'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('courseCurriculum')} ({completedCount}/{totalLessonsCount})
            </button>
            <button
              onClick={() => setActiveTab('QUIZ')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'QUIZ'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('skillTestQuiz')}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'LESSONS' ? (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar: Curriculum Modules & Lessons List */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#090d16] flex flex-col shrink-0">
            {/* Progress Header */}
            <div className="p-4 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">{t('courseProgress')}</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {progressPercent}% {t('completed')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Modules Accordion / List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {ACADEMY_MODULES.map((module) => {
                const modTitle = isBn ? module.titleBn : module.title;
                return (
                  <div key={module.id} className="space-y-1">
                    <div className="px-2 py-1 flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="text-cyan-400 font-mono text-[11px]">{module.number}.</span>
                      <span>{modTitle}</span>
                    </div>

                    <div className="space-y-0.5 pl-2">
                      {module.lessons.map((lesson) => {
                        const isSelected = lesson.id === activeLesson.id;
                        const isCompleted = completedLessonIds.has(lesson.id);
                        const lesTitle = isBn ? lesson.titleBn : lesson.title;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setSelectedLessonId(lesson.id);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-slate-800 text-white font-medium shadow-xs'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-400'
                                    : isSelected
                                    ? 'bg-cyan-400'
                                    : 'bg-slate-700'
                                }`}
                              />
                              <span className="truncate">{lesTitle}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{lesson.readTime}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel: Lesson Content Reader */}
          <div className="flex-1 flex flex-col bg-[#0b0f19] overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Lesson Breadcrumb & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{isBn ? activeModule.titleBn : activeModule.title}</span>
                  <span aria-hidden="true">/</span>
                  <span className="text-cyan-400 font-medium">{lessonTitle}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('readTime')}: {activeLesson.readTime}</span>
                  </span>

                  <button
                    onClick={() => toggleLessonCompleted(activeLesson.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors border ${
                      completedLessonIds.has(activeLesson.id)
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {completedLessonIds.has(activeLesson.id)
                        ? t('completedBadge')
                        : t('markCompleted')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Lesson Title */}
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {lessonTitle}
                </h1>
                <p className="text-slate-400 text-sm mt-1">{lessonSummary}</p>
              </div>

              {/* Main Content Body */}
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4 text-sm font-normal">
                {lessonContent.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                    const [heading, ...rest] = paragraph.split(':**');
                    return (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-bold text-white text-base">
                          {heading.replace('**', '')}
                        </h4>
                        <p className="text-slate-300">{rest.join(':**')}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="whitespace-pre-line leading-relaxed">
                      {paragraph}
                    </div>
                  );
                })}
              </div>

              {/* Key Takeaways Box */}
              <div className="p-4 bg-[#0f172a] rounded-lg border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{t('keyTakeaways')}</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {lessonKeyTakeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next and Previous Lesson Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  onClick={handlePrevLesson}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('prevLesson')}</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  className="flex items-center gap-1 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <span>{t('nextLesson')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#090d16] overflow-y-auto">
          <div className="max-w-xl w-full bg-[#0f172a] border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
            {!isQuizCompleted ? (
              <>
                {/* Quiz Header & Progress */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                  <span className="font-semibold text-slate-400">
                    {t('question')} {currentQuizIndex + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {t('score')}: {quizScore}
                  </span>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {isBn ? currentQuestion.questionBn : currentQuestion.question}
                  </h3>
                  {isBn && (
                    <p className="text-xs text-slate-400 italic">
                      {currentQuestion.questionEn}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {(isBn ? currentQuestion.options : currentQuestion.optionsEn).map((option, idx) => {
                    let optionStyle =
                      'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80';

                    if (selectedOption === idx) {
                      optionStyle = 'bg-cyan-950/40 border-cyan-500 text-white';
                    }

                    if (isAnswerSubmitted) {
                      if (idx === currentQuestion.correctIndex) {
                        optionStyle =
                          'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                      } else if (selectedOption === idx) {
                        optionStyle =
                          'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuizOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center font-mono text-[11px] shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isAnswerSubmitted &&
                          selectedOption === idx &&
                          idx !== currentQuestion.correctIndex && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box when submitted */}
                {isAnswerSubmitted && (
                  <div
                    className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                      selectedOption === currentQuestion.correctIndex
                        ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/70 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{t('correctAnswer')}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>{t('wrongAnswer')}</span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-300 pt-1 leading-relaxed">
                      {isBn ? currentQuestion.explanationBn : currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitQuizAnswer}
                      disabled={selectedOption === null}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      {t('submitAnswer')}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      {currentQuizIndex < QUIZ_QUESTIONS.length - 1
                        ? t('nextQuestion')
                        : t('seeResults')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Quiz Scorecard Result */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{t('quizCompleted')}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t('quizPerformance')}</p>
                </div>

                <div className="p-4 bg-[#090d16] rounded-xl border border-slate-800 max-w-xs mx-auto">
                  <div className="text-3xl font-mono font-bold text-cyan-400">
                    {quizScore} / {QUIZ_QUESTIONS.length}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRestartQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('retakeQuiz')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('LESSONS')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {t('backToLessons')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
