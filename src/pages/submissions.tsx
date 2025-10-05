import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChartSquareBarIcon, UserCircleIcon } from "@heroicons/react/solid";
import Head from "next/head";
import { env } from "~/env.mjs";

import Navbar from "./components/navbar";
import Error from "./404";
import { QUESTION_COUNT } from "../portal/test";

interface Team {
  teamName: string;
  teamMembers: string; // This will be parsed into an array of TeamMember
  email: string;
  answers: Record<string, number>; // Map of question IDs to integer answers
  image: string;
  username: string;
  started: boolean;
  _score?: number; // server-provided score
}

interface TeamMember {
  name: string;
  age: string;
  grade: string;
  school: string;
}

type TeamsData = Record<string, Team[]>;

const SubmissionsTable = () => {
  const { data: session } = useSession();

  const [submissions, setSubmissions] = useState<TeamsData>({});
  const [emails, setEmails] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await fetch("/api/submissions");
      const data: TeamsData = await res.json();
      setSubmissions(data);
    };

    const fetchEmails = async () => {
      const res = await fetch("/api/emails");
      const data = await res.json();
      setEmails(data.Test_Emails || "");
    };

    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        const res = await fetch(`/api/check-admin?email=${encodeURIComponent(session.user.email)}`);
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      }
    };

    void fetchSubmissions();
    void fetchEmails();
    void checkAdminStatus();
  }, [session?.user?.email]);

  const totalCorrect = (_team: Team): number => {
    return typeof _team._score === 'number' ? _team._score : 0;
  };

  const getTeams = Object.keys(submissions).length;

  const getTotalTeamMembers = Object.values(submissions).reduce(
    (total, teams) =>
      total +
      teams.reduce((teamTotal, team) => {
        const members: TeamMember[] = JSON.parse(team.teamMembers || "[]");
        return teamTotal + members.length;
      }, 0),
    0
  );

  const getNumberOfUserAccounts = (emails: string): number =>
    emails.trim() ? emails.split(/\s+/).length : 0;


  // Create a flat array of all teams with their scores for sorting
  const sortedTeams = Object.entries(submissions)
    .flatMap(([_, teams]) => teams)
    .sort((a, b) => {
      const scoreA = totalCorrect(a);
      const scoreB = totalCorrect(b);
      return scoreB - scoreA; // Sort in descending order
    });

  return (
    <>
      {isAdmin ? (
        <>
          <Head>
            <title>Submissions</title>
          </Head>
          <Navbar />
          <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Submissions
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTeams}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalTeamMembers}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total User Accounts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getNumberOfUserAccounts(emails)}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-300 dark:divide-gray-800 dark:border-gray-600">
                <thead className="bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Team Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Total Correct
                    </th>
                    {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                      <th key={i + 1} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Q{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {sortedTeams.map((team) => {
                    const members: TeamMember[] = JSON.parse(team.teamMembers || "[]");
                    return (
                      <tr key={team.email} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={team.image}
                                alt=""
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {team.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {team.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                          {members.map((member) => (
                            <div
                              key={member.name}
                              className="my-1 rounded-xl bg-gray-300 px-2 py-1 dark:bg-gray-500"
                            >
                              <p>
                                <span className="font-semibold">Name:</span>{" "}
                                {member.name}
                              </p>
                              <p>
                                <span className="font-semibold">Age:</span>{" "}
                                {member.age}
                              </p>
                              <p>
                                <span className="font-semibold">Grade:</span>{" "}
                                {member.grade}
                              </p>
                              <p>
                                <span className="font-semibold">School:</span>{" "}
                                {member.school}
                              </p>
                            </div>
                          ))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                          {team.teamName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                          {totalCorrect(team)}/{QUESTION_COUNT}
                        </td>
                        {Array.from({ length: QUESTION_COUNT }, (_, i) => {
                          const id = String(i + 1);
                          return (
                            <td key={id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                              {team.answers[id]?.toString() || ""}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </main>
        </>
      ) : (
        <Error />
      )}
    </>
  );
};

export default SubmissionsTable;
