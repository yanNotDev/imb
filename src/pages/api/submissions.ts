import type { NextApiRequest, NextApiResponse } from "next";
import firestore from "../../firebase";
import { scoreAnswers } from "../../server/correctAnswers";

type Data =
  | {
      data: unknown;
    }
  | {
      message: string;
    };

type SubmissionData = {
  teamMember: string;
  teamName: string;
  started: boolean;
  startTimestamp: number;
  answers: Record<string, string>;
  username: string;
  email: string;
  image: string;
  submitted: boolean;
};

// Augmented response type including server computed score (non-persistent)
type SubmissionWithScore = SubmissionData & { _score: number };

type UserData = {
  [key: string]: SubmissionWithScore[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | UserData>
) {
  try {
    // Create a reference to the user's collection
    const userCollectionRef = firestore.collection("data");

    // Get all documents in the collection
    const snapshot = await userCollectionRef.get();

    // Create an object to hold the user data
    const userData: UserData = {};

    // Loop through each document and add its data to the userData object
    snapshot.forEach((doc) => {
      const user = doc.id;
      const data = doc.data() as SubmissionData;
      if (!userData[user]) {
        userData[user] = [];
      }
      const numericAnswers: Record<string, number | string> = data.answers || {};
      const _score = scoreAnswers(numericAnswers);
      userData[user]?.push({ ...data, _score });
    });

    return res.status(200).json(userData); // return the userData object
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get data" });
  }
}
