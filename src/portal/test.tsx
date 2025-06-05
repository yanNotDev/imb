import { useState, useEffect, useRef } from "react";
import {
  ArrowRightIcon,
  UserAddIcon,
  UserRemoveIcon,
  ViewGridIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  AtSymbolIcon,
  InformationCircleIcon,
  UploadIcon,
  CheckIcon,
  XIcon,
  SpeakerphoneIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import Confetti from "react-confetti";

import useLocalStorage from "../utils/useLocalStorage";
import Question from "./question";
import Modal from "./modal";
import Timer from "./components/Timer";

// Define types for member data
interface TeamMember {
  name: string;
  age: string;
  grade: string;
  school: string;
}

// Define types for submission data
interface Submission {
  email: string;
  teamName: string;
  teamMembers: string;
  answers: Record<string, number>; // Map of question IDs to integer answers
  started: string;
  startTimestamp: number;
  submitted: boolean;
}

// Define the questions array - can be modified to add/remove questions
export const QUESTIONS = [
  { id: "1", placeholder: "Enter an integer answer" },
  { id: "2", placeholder: "Enter an integer answer" },
  { id: "3", placeholder: "Enter an integer answer" },
  // Add more questions as needed
];

// Define correct answers for each question
export const CORRECT_ANSWERS: Record<string, number> = {
  "1": 15552,
  "2": 2,
  "3": 108,
  // Add more correct answers as needed
};

interface Props {
  started: boolean;
  setStarted: (started: boolean) => void;
}

const Test: React.FC<Props> = ({ started, setStarted }) => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [confetti, showConfetti] = useState(false);
  const [layout, setLayout] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverTimestamp, setServerTimestamp] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    // Initialize answers from localStorage if available
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('testAnswers');
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    }
    return {};
  });
  const [newMember, setNewMember] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedInitialState = useRef(false);

  // Update localStorage whenever answers change
  useEffect(() => {
    if (typeof window !== 'undefined' && !submitted) {
      localStorage.setItem('testAnswers', JSON.stringify(answers));
    }
  }, [answers, submitted]);

  // Check test state immediately after sign-in and on refresh
  useEffect(() => {
    const checkTestState = async () => {
      // Only check if we haven't loaded initial state or if session actually changed
      if (!session?.user?.email || (hasLoadedInitialState.current && !session?.user)) {
        return;
      }

      // If we've already loaded the initial state and the session hasn't changed, don't reload
      if (hasLoadedInitialState.current) {
        return;
      }

      setIsLoading(true);
      try {
        console.log("Checking test state for user:", session.user.email);
        const res = await fetch("/api/submissions");
        if (!res.ok) {
          console.error("Failed to fetch test state:", res.statusText);
          return;
        }
        
        const data = await res.json();
        console.log("API Response:", data);
        
        // The API returns an object where each key is a username and value is an array of submissions
        // We need to find the submission for the current user
        let userSubmission: Submission | undefined;
        
        // Search through all submissions to find the one matching our user's email
        Object.values(data).forEach((submissions: unknown) => {
          if (Array.isArray(submissions)) {
            const found = submissions.find((sub: unknown) => {
              if (typeof sub === 'object' && sub !== null && 'email' in sub) {
                return (sub as Submission).email === session.user.email;
              }
              return false;
            });
            if (found) {
              userSubmission = found as Submission;
            }
          }
        });
        
        console.log("Found user submission:", userSubmission);
        
        if (userSubmission?.startTimestamp) {
          console.log("Test exists, restoring state with timestamp:", userSubmission.startTimestamp);
          // Test exists - restore test state and show test interface
          setTeamMembers(JSON.parse(userSubmission.teamMembers));
          setTeamName(userSubmission.teamName.replace('"', "").replace('"', ""));
          // Merge server answers with any local answers that might be more recent
          const serverAnswers = userSubmission.answers || {};
          const localAnswers = localStorage.getItem('testAnswers') ? JSON.parse(localStorage.getItem('testAnswers')!) : {};
          setAnswers({ ...serverAnswers, ...localAnswers });
          setServerTimestamp(userSubmission.startTimestamp);
          setStarted(true);
          setSubmitted(userSubmission.submitted || false);
        } else {
          console.log("No test found for user");
          // No test exists - show team creation interface
          setServerTimestamp(null);
          setStarted(false);
          setSubmitted(false);
          // Clear any existing state
          setTeamMembers([]);
          setTeamName("");
          setAnswers({});
          // Clear localStorage answers if no test exists
          localStorage.removeItem('testAnswers');
        }
      } catch (error) {
        console.error("Error checking test state:", error);
        // On error, show team creation interface
        setServerTimestamp(null);
        setStarted(false);
        setSubmitted(false);
        // Clear any existing state
        setTeamMembers([]);
        setTeamName("");
        setAnswers({});
        // Clear localStorage answers on error
        localStorage.removeItem('testAnswers');
      } finally {
        setIsLoading(false);
        hasLoadedInitialState.current = true;
      }
    };
    void checkTestState();
  }, [session, setStarted]);

  // Function to update a single answer
  const updateAnswer = (questionId: string, value: number | null) => {
    if (submitted) return; // Don't allow updates if submitted
    
    if (value === null) {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow starting a test if no timestamp exists
    if (serverTimestamp) {
      console.error("Cannot start a new test - one already exists");
      return;
    }

    if (teamMembers.length >= 1 && newMember === "" && age === "" && grade === "" && school === "") {
      const timestamp = Date.now();
      
      // Submit initial state to database
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamMember: JSON.stringify(teamMembers),
          teamName: teamName,
          startTimestamp: timestamp,
          answers: {},
          username: session?.user?.name || "",
          email: session?.user?.email || "",
          image: session?.user?.image || "",
          submitted: false,
          started: "true"
        }),
      });

      if (response.ok) {
        setServerTimestamp(timestamp);
        setStarted(true);
      }
    }
  };

  const handleTimeUp = async () => {
    if (!submitted) {
      setSubmitted(true);
      showConfetti(true);
      // Clear localStorage when test is submitted
      localStorage.removeItem('testAnswers');

      // Submit final answers
      await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamMember: JSON.stringify(teamMembers),
          teamName: teamName,
          started: "true",
          startTimestamp: serverTimestamp,
          answers: answers,
          username: session?.user?.name || "",
          email: session?.user?.email || "",
          image: session?.user?.image || "",
          submitted: true
        }),
      });

      setTimeout(() => {
        showConfetti(false);
      }, 2000);
    }
  };

  const gridHandler = () => {
    let returnedString = "grid ";
    if (layout) {
      returnedString += "grid-cols-2 gap-x-4";
    } else {
      returnedString += "grid-cols-1 ";
    }
    return returnedString;
  };

  const buttonSelector = () => {
    if (confetti) {
      return (
        <button className="mr-1 mb-1 flex flex-row items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold uppercase text-white shadow-md outline-none transition-all duration-150 ease-linear hover:bg-red-700 hover:shadow-lg focus:outline-none active:bg-emerald-600">
          <CheckIcon className="mr-2 h-5 w-5" /> Submitted!
        </button>
      );
    } else if (Object.keys(answers).length === QUESTIONS.length && areAllAnswersValid()) {
      return (
        <button
          onClick={() => setShowModal(true)}
          className="mr-1 mb-1 flex flex-row items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase text-white shadow-md outline-none transition-all duration-150 ease-linear hover:bg-red-700 hover:shadow-lg focus:outline-none active:bg-red-600"
        >
          <UploadIcon className="mr-2 h-5 w-5" /> Submit
        </button>
      );
    } else {
      return (
        <button className="mr-1 mb-1 flex flex-row items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase text-white opacity-70 shadow-md outline-none transition-all">
          <XIcon className="mr-2 h-5 w-5" /> Complete all questions with valid integers
        </button>
      );
    }
  };

  // Function to validate all answers are valid integers
  const areAllAnswersValid = (): boolean => {
    return Object.keys(answers).length === QUESTIONS.length && 
           Object.values(answers).every(answer => Number.isInteger(answer));
  };

  const addMember = () => {
    if (
      newMember.trim() !== "" &&
      age.trim() !== "" &&
      grade.trim() !== "" &&
      school.trim() !== ""
    ) {
      setTeamMembers([
        ...teamMembers,
        { name: newMember.trim(), age, grade, school },
      ]);
      setNewMember("");
      setAge("");
      setGrade("");
      setSchool("");
    }
  };

  const removeMember = (index: number) => {
    const updatedTeamMembers = [...teamMembers];
    updatedTeamMembers.splice(index, 1);
    setTeamMembers(updatedTeamMembers);
  };

  if (isLoading) {
    return (
      <section className="flex h-[calc(100vh-3.58rem)] items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`scrollbar z-10 ${started ? 'col-span-7 md:col-span-7' : 'col-span-12 md:col-span-12'} h-[calc(100vh-3.58rem)] overflow-y-scroll bg-white p-4 dark:bg-gray-900 md:p-8`}>
      <Confetti
        numberOfPieces={confetti ? 150 : 0}
      />
      {started ? (
        <div className="relative flex flex-col">
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            teamName={teamName}
            teamMembers={teamMembers}
            showConfetti={showConfetti}
            isSubmitted={submitted}
            answers={answers}
          />

          {!submitted && serverTimestamp && (
            <Timer
              startTimestamp={serverTimestamp}
              onTimeUp={handleTimeUp}
              isSubmitted={submitted}
              duration={90}
            />
          )}

          <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 p-4 shadow-sm dark:bg-gray-800 md:p-6">
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300 md:text-base">
              <UserCircleIcon className="mr-2 h-8 w-8 text-imb-yellow dark:text-imb-blue" /> Signed in as{" "}
              {session ? session?.user?.name : "Guest"}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setLayout(!layout)}
                className="flex items-center rounded-lg bg-gradient-to-r from-imb-yellow to-imb-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:shadow-md hover:shadow-imb-yellow/20 focus:outline-none focus:ring-2 focus:ring-imb-yellow/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <ViewGridIcon className="mr-1 h-5 w-5" /> Switch Layout
              </button>
            </div>
          </div>
          <div className={gridHandler()}>
            {QUESTIONS.map((question) => (
              <Question
                key={question.id}
                id={question.id}
                value={answers[question.id] ?? null}
                onChange={(value) => updateAnswer(question.id, value)}
                placeholder={question.placeholder}
                disabled={submitted}
              />
            ))}
          </div>
          {!submitted && buttonSelector()}
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="mb-8 max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
              Welcome to the{" "}
              <span className="bg-gradient-to-r from-imb-yellow to-imb-blue bg-clip-text text-transparent">
                IMB 
              </span>{" "}
              Test!
            </h1>
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900 dark:text-white">
                <InformationCircleIcon className="mr-2 h-6 w-6 text-imb-yellow dark:text-imb-blue" /> A Few Things to Keep in Mind:
              </h2>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 md:text-base">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-imb-yellow dark:bg-imb-blue"></span>
                  Please ensure that you have a stable internet connection.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-imb-yellow dark:bg-imb-blue"></span>
                  The test is timed for 60 minutes. Your answers will be automatically submitted when time runs out.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-imb-yellow dark:bg-imb-blue"></span>
                  Discussion on forums such as AoPS or the discord server is strictly prohibited.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-imb-yellow dark:bg-imb-blue"></span>
                  You may only collaborate with other members of your team. The maximum team size is 4.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-imb-yellow dark:bg-imb-blue"></span>
                  If you experience any technical issues, please contact the competition organizers immediately.
                </li>
              </ul>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  htmlFor="teamName"
                >
                  <div className="flex items-center">
                    <AtSymbolIcon className="mr-2 h-5 w-5 text-imb-yellow dark:text-imb-blue" /> Team Name
                  </div>
                </label>

                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition duration-150 focus:border-imb-yellow focus:outline-none focus:ring-1 focus:ring-imb-yellow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-imb-blue dark:focus:ring-imb-blue"
                  id="teamName"
                  type="text"
                  placeholder="Enter your team name"
                  required
                  onChange={(event) => setTeamName(event.target.value)}
                  maxLength={30}
                  value={teamName}
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  htmlFor="teamMembers"
                >
                  <div className="flex items-center">
                    <UserGroupIcon className="mr-2 h-5 w-5 text-imb-yellow dark:text-imb-blue" /> Team Members
                  </div>
                </label>
                <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <UserIcon className="h-5 w-5 text-imb-yellow dark:text-imb-blue" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Member {index + 1}: {member.name}
                        </span>
                        <span className="rounded-full bg-imb-yellow/10 px-2.5 py-0.5 text-xs font-medium text-imb-yellow dark:bg-imb-blue/10 dark:text-imb-blue">
                          Age {member.age}
                        </span>
                        <span className="rounded-full bg-imb-blue/10 px-2.5 py-0.5 text-xs font-medium text-imb-blue dark:bg-imb-yellow/10 dark:text-imb-yellow">
                          Grade {member.grade}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {member.school}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-gray-500 transition duration-150 hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700"
                        onClick={() => removeMember(index)}
                      >
                        <UserRemoveIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {teamMembers.length < 4 && (
                    <div className="flex flex-wrap gap-3">
                      <input
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition duration-150 focus:border-imb-yellow focus:outline-none focus:ring-1 focus:ring-imb-yellow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-imb-blue dark:focus:ring-imb-blue"
                        type="text"
                        placeholder="Add a team member"
                        value={newMember}
                        onChange={(event) => setNewMember(event.target.value)}
                        maxLength={20}
                        required={teamMembers.length < 1}
                      />
                      <input
                        className="w-24 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition duration-150 focus:border-imb-yellow focus:outline-none focus:ring-1 focus:ring-imb-yellow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-imb-blue dark:focus:ring-imb-blue"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(event) => setAge(event.target.value)}
                        max={18}
                        min={0}
                        required={teamMembers.length < 1}
                      />
                      <input
                        className="w-24 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition duration-150 focus:border-imb-yellow focus:outline-none focus:ring-1 focus:ring-imb-yellow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-imb-blue dark:focus:ring-imb-blue"
                        type="number"
                        placeholder="Grade"
                        value={grade}
                        onChange={(event) => setGrade(event.target.value)}
                        max={12}
                        min={0}
                        required={teamMembers.length < 1}
                      />
                      <input
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition duration-150 focus:border-imb-yellow focus:outline-none focus:ring-1 focus:ring-imb-yellow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-imb-blue dark:focus:ring-imb-blue"
                        type="text"
                        placeholder="School Name"
                        value={school}
                        onChange={(event) => setSchool(event.target.value)}
                        maxLength={30}
                        required={teamMembers.length < 1}
                      />
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-imb-yellow to-imb-blue p-2.5 text-white shadow-sm transition duration-150 hover:shadow-md hover:shadow-imb-yellow/20 focus:outline-none focus:ring-2 focus:ring-imb-yellow/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        onClick={() => addMember()}
                      >
                        <UserAddIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {teamMembers.length >= 1 &&
              newMember === "" &&
              age === "" &&
              grade === "" &&
              school === "" ? (
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-imb-yellow to-imb-blue px-6 py-3 text-sm font-medium text-white shadow-sm transition duration-150 hover:shadow-md hover:shadow-imb-yellow/20 focus:outline-none focus:ring-2 focus:ring-imb-yellow/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Begin Test <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-400 shadow-sm dark:bg-gray-800 dark:text-gray-500"
                >
                  Begin Test <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Test;