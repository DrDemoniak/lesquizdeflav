import { useEffect, useState } from 'react';

// Lecture du module depuis l'URL (?module=nom-du-module). Null = page d'accueil.
const params = new URLSearchParams(window.location.search);
const MODULE = params.get('module');

// Mélange aléatoire des propositions — appelé au chargement et au restart.
const shuffleQuestions = (data) => ({
  ...data,
  questions: data.questions.map(q => {
    const options = [...q.answerOptions];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...q, answerOptions: options };
  }),
});

// Clé localStorage isolée par module pour ne pas mélanger les progressions.
const LOCAL_STORAGE_KEY = MODULE ? `quiz_progress_${MODULE}` : null;
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function App() {
  const [questionsData, setQuestionsData] = useState(null);
  const [quizList, setQuizList] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // Lecture synchrone pour éviter l'écrasement au premier rendu.
  const getSaved = (key, defaultVal) => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error('Erreur localStorage', e);
    }

    return defaultVal;
  };

  const [started, setStarted] = useState(() => getSaved('started', false));
  const [currentIndex, setCurrentIndex] = useState(() => getSaved('currentIndex', 0));
  const [answers, setAnswers] = useState(() => getSaved('answers', {}));
  const [showResult, setShowResult] = useState(() => getSaved('showResult', false));
  const [currentAnswer, setCurrentAnswer] = useState(() => getSaved('currentAnswer', null));
  const [revealedHints, setRevealedHints] = useState(() => getSaved('revealedHints', {}));
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [learnerName, setLearnerName] = useState('');
  const [printTimestamp, setPrintTimestamp] = useState('');

  useEffect(() => {
    if (!MODULE) {
      // Mode index : charge la liste des quiz disponibles
      console.log('[QUIZ] Mode accueil — chargement de l\'index');
      fetch('/quiz-content/index.json')
        .then((r) => r.json())
        .then((data) => {
          console.log(`[QUIZ] Index chargé : ${data.quizzes.length} quiz trouvé(s)`);
          setQuizList(data.quizzes);
        })
        .catch((error) => {
          console.error('[QUIZ] Erreur index :', error.message);
          setLoadError(true);
        });
      return;
    }

    // Mode quiz : charge le module demandé
    console.log(`[QUIZ] Chargement du module : ${MODULE}`);
    fetch(`/quiz-content/${MODULE}/questions.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Module introuvable : ${MODULE}`);
        return response.json();
      })
      .then((data) => {
        console.log(`[QUIZ] Module chargé : ${data.title} (${data.questions.length} questions)`);
        const shuffled = shuffleQuestions(data);
        setQuestionsData(shuffled);
        // Réinitialiser la progression : les anciens indices localStorage ne correspondent plus au nouvel ordre.
        setCurrentIndex(0);
        setAnswers({});
        setCurrentAnswer(null);
        setRevealedHints({});
      })
      .catch((error) => {
        console.error('[QUIZ] Erreur de chargement :', error.message);
        setLoadError(true);
      });
  }, []);

  // Sauvegarde automatique pour restaurer exactement l'état du quiz.
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        started,
        currentIndex,
        answers,
        showResult,
        currentAnswer,
        revealedHints,
      })
    );
  }, [started, currentIndex, answers, showResult, currentAnswer, revealedHints]);

  // Horodatage fixé une seule fois à l'affichage des résultats.
  useEffect(() => {
    if (showResult && !printTimestamp) {
      setPrintTimestamp(new Date().toLocaleString('fr-FR'));
    }
  }, [showResult]);

  const handleStart = () => {
    console.log('Quiz started');
    setStarted(true);
  };

  const handleOptionSelect = (optionIndex, isCorrect) => {
    if (currentAnswer !== null) {
      return;
    }

    const answerRecord = {
      selectedOption: optionIndex,
      isCorrect,
      status: isCorrect ? 'correct' : 'incorrect',
    };

    console.log('Quiz answer selected', {
      questionIndex: currentIndex,
      selectedOption: optionIndex,
      isCorrect,
    });

    console.log('Quiz hint hidden after answer selection', {
      questionIndex: currentIndex,
    });

    setRevealedHints((prev) => ({
      ...prev,
      [currentIndex]: false,
    }));
    setCurrentAnswer(optionIndex);
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answerRecord,
    }));
  };

  const handleToggleHint = () => {
    if (currentAnswer !== null) {
      console.log('Quiz hint toggle ignored because answer already selected', {
        questionIndex: currentIndex,
      });
      return;
    }

    console.log('Quiz hint toggled', {
      questionIndex: currentIndex,
      willOpen: !revealedHints[currentIndex],
    });

    setRevealedHints((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleNextQuestion = () => {
    const totalQuestions = questionsData.questions.length;

    if (currentAnswer === null && !answers[currentIndex]) {
      console.log('Quiz question passed', {
        questionIndex: currentIndex,
      });

      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: { status: 'passed' },
      }));
    }

    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      const nextAnswer = answers[nextIndex];

      console.log('Quiz moved to next question', {
        fromQuestionIndex: currentIndex,
        toQuestionIndex: nextIndex,
      });

      setCurrentIndex(nextIndex);
      setCurrentAnswer(
        nextAnswer && typeof nextAnswer.selectedOption === 'number'
          ? nextAnswer.selectedOption
          : null
      );
      return;
    }

    console.log('Quiz completed', {
      totalQuestions,
    });
    setShowResult(true);
  };

  const handleRestart = () => {
    console.log('Quiz restarted');

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setCurrentAnswer(null);
    setRevealedHints({});
    setQuestionsData(prev => prev ? shuffleQuestions(prev) : prev);
  };

  // Page d'accueil : liste des quiz disponibles
  if (!MODULE) {
    return (
      <div className="min-h-screen flex flex-col bg-notebook-bg">
        <header className="border-b border-notebook-border px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/quiz-content/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-medium text-notebook-text">Quiz</h1>
          </div>
          <a
            href="https://cv-jean-noel.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-notebook-accent hover:underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Par Jean Noël Lefebvre - L5J
          </a>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50/50">
          {!quizList ? (
            <div className="text-notebook-accent text-xl font-medium animate-pulse">
              Chargement...
            </div>
          ) : (
            <div className="max-w-2xl w-full space-y-6">
              <h2 className="text-2xl font-medium text-notebook-text text-center">
                Choisissez votre quiz
              </h2>
              <div className="space-y-4">
                {quizList.map((quiz) => (
                  <a
                    key={quiz.module}
                    href={`?module=${quiz.module}`}
                    className="block bg-white rounded-2xl border border-notebook-border p-6 shadow-sm hover:shadow-md hover:border-notebook-accent transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-notebook-text group-hover:text-notebook-accent transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{quiz.description}</p>
                      </div>
                      <span className="text-notebook-accent text-xl shrink-0 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-notebook-bg">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-xl font-medium">Quiz introuvable</p>
          <p className="text-gray-500 text-sm">Module « {MODULE} » non disponible.</p>
          <a href="/" className="text-notebook-accent text-sm hover:underline">
            Retour au choix de quiz
          </a>
        </div>
      </div>
    );
  }

  if (!questionsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-notebook-bg">
        <div className="text-notebook-accent text-xl font-medium animate-pulse">
          Chargement du quiz...
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-notebook-bg">
        <header className="border-b border-notebook-border px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/quiz-content/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <a href="/" title="Accueil" className="text-gray-400 hover:text-notebook-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </a>
            <h1 className="text-xl font-medium text-notebook-text">{questionsData.title}</h1>
          </div>
          <a
            href="https://cv-jean-noel.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-notebook-accent hover:underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Par Jean Noël Lefebvre - L5J
          </a>
        </header>
        <main className="flex-grow flex items-center justify-center p-6 bg-gray-50/50">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-notebook-border p-10 text-center space-y-6">
            <h2 className="text-3xl font-medium tracking-tight">Quiz</h2>
            <p className="text-gray-500 text-lg">{questionsData.description}</p>
            <button
              onClick={handleStart}
              className="mt-4 px-8 py-3 bg-notebook-accent text-white rounded-full font-medium hover:bg-[#4454ef] transition-colors"
            >
              Démarrer l'évaluation
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handlePrintConfirm = () => {
    setPrintTimestamp(new Date().toLocaleString('fr-FR'));
    setShowPrintModal(false);
    setTimeout(() => window.print(), 150);
  };

  if (showResult) {
    const total = questionsData.questions.length;
    const answerRecords = questionsData.questions.map((_, index) => answers[index] ?? null);
    const correctCount = answerRecords.filter((answer) => answer?.status === 'correct').length;
    const incorrectCount = answerRecords.filter((answer) => answer?.status === 'incorrect').length;
    const passedCount = answerRecords.filter((answer) => answer?.status === 'passed').length;
    const percentage = Math.round((correctCount / total) * 100);

    const themes = questionsData.themes ?? [];

    return (
      <div className="min-h-screen flex flex-col bg-gray-50/50 overflow-hidden">
        <header className="border-b border-notebook-border px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center bg-notebook-bg shrink-0 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/quiz-content/logo.png" alt="Logo" className="w-7 h-7 object-contain shrink-0" />
            <a href="/" title="Accueil" className="text-gray-400 hover:text-notebook-accent transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </a>
            <h1 className="text-[1.05rem] sm:text-[1.15rem] font-medium text-notebook-text truncate">
              {questionsData.title}
            </h1>
          </div>
          <a
            href="https://cv-jean-noel.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block text-xs sm:text-sm font-medium text-notebook-accent hover:underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Par Jean Noël Lefebvre - L5J
          </a>
        </header>

        <div className="flex-1 min-h-0 flex flex-col items-center px-4 py-4 sm:px-6 sm:py-5 overflow-hidden">
          <div className="max-w-4xl w-full flex-1 min-h-0">
          <div className="bg-white rounded-3xl border border-notebook-border px-8 py-7 sm:px-9 sm:py-8 shadow-sm h-full flex flex-col min-h-0">
            <h2 className="text-[2rem] sm:text-[2.35rem] font-medium mb-6 sm:mb-7 shrink-0">{questionsData.title} terminé.</h2>

            <div className="bg-gray-50 rounded-2xl px-6 py-6 sm:px-8 sm:py-6 flex items-center justify-around mb-5 sm:mb-6 gap-6 sm:gap-8 flex-col sm:flex-row shrink-0">
              <div
                className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#16a34a ${percentage}%, #d1d5db ${percentage}% 100%)`,
                }}
              >
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                  <span className="text-[2.5rem] sm:text-[3rem] font-medium leading-none">
                    {correctCount}/{total}
                  </span>
                  <span className="text-gray-500 text-sm mt-1">{percentage}%</span>
                </div>
              </div>

              <div className="space-y-3 text-[1.05rem] sm:text-lg">
                <div className="flex justify-between w-44 sm:w-48">
                  <span className="text-gray-600">Correctes</span>
                  <span className="font-medium text-green-600">{correctCount}</span>
                </div>
                <div className="flex justify-between w-44 sm:w-48">
                  <span className="text-gray-600">Incorrectes</span>
                  <span className="font-medium text-gray-900">{incorrectCount}</span>
                </div>
                <div className="flex justify-between w-44 sm:w-48">
                  <span className="text-gray-600">Passées</span>
                  <span className="font-medium text-gray-900">{passedCount}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 sm:pt-6 mt-5 sm:mt-6 flex-1 min-h-0 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 shrink-0">
                <h3 className="text-lg sm:text-xl font-medium">Thèmes abordés</h3>
                <div className="flex gap-3 flex-wrap self-start sm:self-auto print:hidden">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 border border-gray-300 text-gray-600 rounded-full text-[0.95rem] sm:text-[1rem] font-medium hover:bg-gray-50 transition-colors"
                  >
                    Imprimer le rapport
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 bg-notebook-accent text-white rounded-full text-[0.95rem] sm:text-[1rem] font-medium hover:bg-[#4454ef] transition-colors shadow-sm"
                  >
                    Recommencer le quiz
                  </button>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1 text-[1rem] sm:text-[1.05rem]">
                {themes.map((theme, index) => (
                  <li key={index} className="flex gap-3 text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    {theme}
                  </li>
                ))}
              </ul>

              {/* Récap détaillé — masqué à l'écran, visible à l'impression */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 border-t border-gray-200 pt-5">Récapitulatif détaillé</h3>
                <div className="mb-5 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600"><span className="font-medium">Participant :</span> {learnerName || 'Non renseigné'}</p>
                  <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Date et heure :</span> {printTimestamp}</p>
                </div>
                {questionsData.questions.map((q, idx) => {
                  const record = answers[idx];
                  const correctOption = q.answerOptions.find((o) => o.isCorrect);
                  const selectedOption = record && record.status !== 'passed' ? q.answerOptions[record.selectedOption] : null;
                  const status = record?.status ?? 'passed';
                  return (
                    <div key={idx} className="print-question mb-5 pb-5 border-b border-gray-100 last:border-0">
                      <p className="font-medium text-gray-900 mb-2">
                        <span className="text-gray-400 mr-2">{idx + 1}.</span>
                        {q.question}
                      </p>
                      {status === 'passed' ? (
                        <p className="text-sm text-gray-500 italic">Question passée.</p>
                      ) : (
                        <>
                          <p className={`text-sm mb-1 ${status === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                            <span className="font-medium">{status === 'correct' ? '✓' : '✗'} Votre réponse :</span>{' '}{selectedOption?.text}
                          </p>
                          {status === 'incorrect' && selectedOption?.rationale && (
                            <p className="text-sm text-gray-500 ml-4 mb-1">{selectedOption.rationale}</p>
                          )}
                          {status === 'incorrect' && (
                            <p className="text-sm text-green-700 mb-1">
                              <span className="font-medium">✓ Bonne réponse :</span>{' '}{correctOption?.text}
                            </p>
                          )}
                          {correctOption?.rationale && (
                            <p className="text-sm text-gray-500 ml-4">{correctOption.rationale}</p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        </div>
      {/* Modal saisie du nom avant impression */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-7 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Imprimer le rapport</h3>
            <label className="block text-sm text-gray-600 mb-2">Nom et prénom du participant</label>
            <input
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePrintConfirm();
                if (e.key === 'Escape') setShowPrintModal(false);
              }}
              placeholder="ex : Marie Dupont"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-notebook-accent"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePrintConfirm}
                disabled={!learnerName.trim()}
                className="px-5 py-2 text-sm bg-notebook-accent text-white rounded-full hover:bg-[#4454ef] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer et imprimer
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  const question = questionsData.questions[currentIndex];
  const hasAnswered = currentAnswer !== null;
  const isHintOpen = Boolean(revealedHints[currentIndex]);
  const shouldShowHint = isHintOpen && !hasAnswered && Boolean(question.hint);

  return (
    <div className="min-h-screen flex flex-col bg-notebook-bg">
      <header className="border-b border-notebook-border px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/quiz-content/logo.png" alt="Logo" className="w-7 h-7 object-contain shrink-0" />
          <a href="/" title="Accueil" className="text-gray-400 hover:text-notebook-accent transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </a>
          <h1 className="text-[1.05rem] sm:text-[1.15rem] font-medium text-notebook-text truncate">
            {questionsData.title}
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <a
            href="https://cv-jean-noel.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block text-xs sm:text-sm font-medium text-notebook-accent hover:underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Par Jean Noël Lefebvre - L5J
          </a>
          <div className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {currentIndex + 1} / {questionsData.questions.length}
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6 bg-notebook-bg">
        <div className="max-w-[760px] w-full flex-1 min-h-0 flex flex-col">
          <div className="w-full bg-[#e9edf5] rounded-full h-1 mb-4 sm:mb-5 overflow-hidden shrink-0">
            <div
              className="bg-notebook-accent h-1 transition-all duration-500"
              style={{ width: `${(currentIndex / questionsData.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-3 sm:pb-4">
              <h2 className="text-[1.08rem] sm:text-[1.15rem] font-bold leading-[1.45] tracking-[-0.01em] text-notebook-text mb-5 sm:mb-6 pr-4">
                {question.question}
              </h2>

              <div className="space-y-2.5 sm:space-y-3">
                {question.answerOptions.map((option, index) => {
                  const isSelected = currentAnswer === index;
                  const isCorrectOption = option.isCorrect;

                  let cardStyle =
                    'border-transparent bg-[#f7f8fa] hover:bg-[#f1f3f6] text-notebook-text';
                  let labelStyle = 'text-gray-700';

                  if (hasAnswered) {
                    if (isCorrectOption) {
                      cardStyle = 'border-green-400 bg-green-50 text-green-950';
                      labelStyle = 'text-green-800';
                    } else if (isSelected) {
                      cardStyle = 'border-red-400 bg-red-50 text-red-950';
                      labelStyle = 'text-red-800';
                    } else {
                      cardStyle = 'border-transparent bg-[#f7f8fa] text-gray-500';
                      labelStyle = 'text-gray-500';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index, option.isCorrect)}
                      disabled={hasAnswered}
                      className={`w-full rounded-[18px] border px-4 py-4 sm:px-5 sm:py-[1.05rem] text-left transition-all ${cardStyle} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start gap-3.5 sm:gap-4 text-[1.08rem] sm:text-[1.15rem] leading-[1.4]">
                        <span className={`w-7 sm:w-8 flex-shrink-0 font-medium ${labelStyle}`}>
                          {OPTION_LABELS[index]}.
                        </span>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-notebook-border bg-notebook-bg pt-3 sm:pt-4">
              <div className="flex items-center justify-between gap-4">
                {hasAnswered ? <div /> : (
                  <button
                    onClick={handleToggleHint}
                    className="inline-flex items-center gap-2 text-[0.98rem] sm:text-[1.02rem] font-medium text-notebook-text hover:text-notebook-accent transition-colors"
                  >
                    <span>Indice</span>
                    <span
                      className={`text-sm transition-transform ${isHintOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      ^
                    </span>
                  </button>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full bg-notebook-accent text-white text-[0.95rem] sm:text-[1rem] font-medium hover:bg-[#4454ef] transition-colors shadow-sm"
                >
                  {currentIndex === questionsData.questions.length - 1 ? 'Résultats' : 'Suivante'}
                </button>
              </div>

              {shouldShowHint || hasAnswered ? (
                <div className="mt-4 space-y-3 max-h-[22vh] overflow-y-auto pr-1">
                  {shouldShowHint && (
                    <div className="rounded-[16px] bg-[#eef1ff] border border-[#e2e7ff] px-4 py-4 sm:px-5 sm:py-4 text-notebook-text animate-fade-in">
                      <div className="flex gap-3 items-start">
                        <div className="text-xl sm:text-2xl leading-none" aria-hidden="true">
                          💡
                        </div>
                        <p className="text-[0.96rem] sm:text-[1rem] leading-[1.55]">{question.hint}</p>
                      </div>
                    </div>
                  )}

                  {hasAnswered && (
                    <div
                      className={`px-4 py-4 sm:px-5 sm:py-4 rounded-[16px] animate-fade-in ${
                        question.answerOptions[currentAnswer].isCorrect
                          ? 'bg-green-50 text-green-900'
                          : 'bg-red-50 text-red-900'
                      }`}
                    >
                      <div className="font-semibold text-[0.96rem] mb-2 flex items-center gap-2">
                        {question.answerOptions[currentAnswer].isCorrect ? 'Correct !' : 'Incorrect'}
                      </div>
                      <p className="text-[0.95rem] leading-[1.55] opacity-90">
                        {question.answerOptions[currentAnswer].rationale}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
