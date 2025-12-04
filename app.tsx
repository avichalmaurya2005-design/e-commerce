import React, { useState } from 'react';
import { Course, SchedulePreferences, ClassSession } from './types';
import CourseInput from './components/CourseInput';
import ScheduleSettings from './components/ScheduleSettings';
import ScheduleView from './components/ScheduleView';
import WorkloadChart from './components/WorkloadChart';
import { generateSmartSchedule } from './services/geminiService';
import { Calendar, Sparkles, Loader2, AlertCircle, Github } from 'lucide-react';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [preferences, setPreferences] = useState<SchedulePreferences>({
    startTime: '08:00',
    endTime: '15:00',
    lunchDuration: 45,
    includeBreaks: true
  });
  
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (courses.length === 0) {
      setError("Please add at least one course to generate a schedule.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const result = await generateSmartSchedule(courses, preferences);
      setSchedule(result.sessions);
      setAiSummary(result.summary);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              SmartSchedule
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                AI Planner
              </h2>
              <p className="text-indigo-100 text-sm mb-4">
                Define your courses and preferences, then let Gemini AI build your perfect weekly timetable.
              </p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Schedule
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <CourseInput courses={courses} setCourses={setCourses} />
            <ScheduleSettings preferences={preferences} setPreferences={setPreferences} />
            
            {/* Show chart only if we have schedule data */}
            {schedule.length > 0 && (
              <div className="hidden lg:block">
                 <WorkloadChart sessions={schedule} courses={courses} />
              </div>
            )}
          </div>

          {/* Right Panel: Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {schedule.length > 0 ? (
              <>
                 <ScheduleView sessions={schedule} courses={courses} summary={aiSummary} />
                 {/* Mobile chart view */}
                 <div className="block lg:hidden h-96">
                    <WorkloadChart sessions={schedule} courses={courses} />
                 </div>
              </>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Calendar className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Schedule Generated Yet</h3>
                <p className="max-w-md">
                  Add your courses on the left sidebar and click "Generate Schedule" to see your AI-optimized weekly plan here.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;
