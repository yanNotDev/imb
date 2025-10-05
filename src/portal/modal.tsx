import { useSession } from "next-auth/react";
import { XIcon, UploadIcon } from "@heroicons/react/solid";

interface TeamMember {
  name: string;
  age: string;
  grade: string;
  school: string;
}

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  teamName: string;
  teamMembers: TeamMember[];
  showConfetti: (show: boolean) => void;
  isSubmitted?: boolean;
  answers: Record<string, number>;
}

const Modal: React.FC<Props> = ({
  showModal,
  setShowModal,
  teamName,
  teamMembers,
  showConfetti,
  isSubmitted = false,
  answers,
}) => {
  const { data: session } = useSession();

  const submissionHandler = async () => {
    if (isSubmitted) {
      setShowModal(false);
      return;
    }

    setShowModal(false);
    showConfetti(true);
    //Submit to database
    await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamMember: JSON.stringify(teamMembers),
        teamName: teamName,
        started: true,
        answers: answers,
        username: session?.user.name || "",
        email: session?.user.email || "",
        image: session?.user.image || "",
        submitted: true,
      }),
    }).then((res) => res.json());

    setTimeout(() => {
      showConfetti(false);
    }, 2000);
  };

  return showModal ? (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
        <div className="relative my-6 mx-auto w-auto max-w-3xl">
          <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none dark:bg-gray-800">
            <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5 dark:border-slate-700">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
                {isSubmitted ? "Answers Already Submitted" : "Confirm Submission"}
              </h3>
              <button
                className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none dark:text-white"
                onClick={() => setShowModal(false)}
              >
                <span className="block h-6 w-6 bg-transparent text-2xl text-black opacity-5 outline-none focus:outline-none dark:text-white">
                  ×
                </span>
              </button>
            </div>
            <div className="relative flex-auto p-6 py-4">
              <div className="my-3 text-lg leading-relaxed text-slate-500 duration-150 dark:text-slate-400">
                {isSubmitted ? (
                  <p>Your answers have already been submitted and cannot be modified.</p>
                ) : (
                  <>
                    <p>You will be able to submit another set of answers.</p>
                    <p className="mt-2 text-base">
                      Submitting for {teamName}:
                    </p>
                    <div className="mt-2 flex flex-row gap-2">
                      {teamMembers.map((member) => (
                        <p
                          className="rounded-lg bg-gray-200 px-2 py-1 text-sm dark:bg-gray-800"
                          key={member.name}
                        >
                          {member.name}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6 duration-150 dark:border-slate-800">
              <button
                className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:text-red-600 focus:outline-none"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              {!isSubmitted && (
                <button
                  className="mr-1 mb-1 flex flex-row items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:bg-emerald-600 hover:shadow-lg focus:outline-none active:bg-emerald-600"
                  type="submit"
                  onClick={() => submissionHandler()}
                >
                  <UploadIcon className="mr-2 h-5 w-5 " /> Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-40"></div>
    </>
  ) : null;
};

export default Modal;
